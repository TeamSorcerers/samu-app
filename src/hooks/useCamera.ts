import { useState, useRef, useCallback } from 'react';

export interface RecordedVideo {
  blob: Blob;
  url: string;
  duration: number;
  size: number;
  thumbnail?: string;
}

export function useCamera() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVideo, setRecordedVideo] = useState<RecordedVideo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startPreview = useCallback(async () => {
    try {
      setError(null);
      
      // Solicitar acesso à câmera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Câmera frontal por padrão
        },
        audio: true
      });

      streamRef.current = stream;
      
      // Verificar tracks de áudio e vídeo
      const audioTracks = stream.getAudioTracks();
      const videoTracks = stream.getVideoTracks();
      
      console.log('Stream configurado:', {
        audioTracks: audioTracks.length,
        videoTracks: videoTracks.length,
        audioEnabled: audioTracks.length > 0 ? audioTracks[0].enabled : false,
        videoEnabled: videoTracks.length > 0 ? videoTracks[0].enabled : false,
        audioSettings: audioTracks.length > 0 ? audioTracks[0].getSettings() : null
      });
      
      if (audioTracks.length === 0) {
        console.warn('Nenhuma track de áudio encontrada! Verificar permissões do microfone.');
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsPreviewing(true);
    } catch (err) {
      console.error('Erro ao acessar a câmera:', err);
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
            setError('Acesso à câmera negado. Permita o acesso para gravar vídeos.');
            break;
          case 'NotFoundError':
            setError('Nenhuma câmera encontrada no dispositivo.');
            break;
          case 'NotReadableError':
            setError('Câmera está sendo usada por outro aplicativo.');
            break;
          default:
            setError('Erro ao acessar a câmera. Tente novamente.');
        }
      } else {
        setError('Erro desconhecido ao acessar a câmera.');
      }
    }
  }, []);

  const stopPreview = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsPreviewing(false);
  }, []);

  // Função para capturar primeiro frame como thumbnail
  const captureFirstFrame = useCallback(async (videoUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context não disponível'));
        return;
      }
      
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        // Definir tamanho do canvas baseado no vídeo
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Posicionar no primeiro frame
        video.currentTime = 0.1; // Pequeno offset para garantir que temos dados
      };
      
      video.onseeked = () => {
        try {
          // Desenhar frame atual no canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Converter para data URL
          const dataURL = canvas.toDataURL('image/jpeg', 0.8);
          
          // Cleanup
          video.src = '';
          video.load();
          
          resolve(dataURL);
        } catch (err) {
          reject(err);
        }
      };
      
      video.onerror = () => {
        reject(new Error('Erro ao carregar vídeo'));
      };
      
      video.src = videoUrl;
    });
  }, []);

  const startRecording = useCallback(async () => {
    if (!streamRef.current) {
      await startPreview();
      if (!streamRef.current) return;
    }

    try {
      chunksRef.current = [];
      
      // Verificar se o navegador suporta MediaRecorder
      let mimeType = '';
      const options: MediaRecorderOptions = {
        audioBitsPerSecond: 128000, // 128 kbps para áudio
        videoBitsPerSecond: 2500000, // 2.5 Mbps para vídeo
      };
      
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        mimeType = 'video/webm;codecs=vp9,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mimeType = 'video/webm;codecs=vp8,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        mimeType = 'video/webm;codecs=vp8';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      } else {
        throw new Error('Nenhum formato de vídeo suportado pelo navegador');
      }

      if (mimeType) {
        options.mimeType = mimeType;
      }

      console.log('Configuração do MediaRecorder:', { 
        mimeType, 
        options,
        audioTracks: streamRef.current.getAudioTracks().length,
        videoTracks: streamRef.current.getVideoTracks().length
      });

      const mediaRecorder = new MediaRecorder(streamRef.current, options);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        console.log('Dados disponíveis:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('MediaRecorder parou. Chunks coletados:', chunksRef.current.length);
        
        if (chunksRef.current.length === 0) {
          console.warn('Nenhum dado de vídeo capturado');
          setError('Nenhum dado foi gravado. Tente novamente.');
          return;
        }
        
        const blob = new Blob(chunksRef.current, { 
          type: mediaRecorder.mimeType || 'video/webm'
        });
        
        console.log('Blob criado:', { size: blob.size, type: blob.type });
        
        // Verificar se o blob tem conteúdo válido
        if (blob.size === 0) {
          console.warn('Blob de vídeo vazio');
          setError('Erro na gravação: vídeo vazio');
          return;
        }
        
        const url = URL.createObjectURL(blob);
        const duration = Date.now() - startTimeRef.current;
        
        console.log('Vídeo processado:', { 
          duration: Math.floor(duration / 1000), 
          size: blob.size,
          url: url.substring(0, 50) + '...'
        });
        
        // Capturar primeiro frame como thumbnail
        setTimeout(async () => {
          try {
            const thumbnail = await captureFirstFrame(url);
            setRecordedVideo(prevVideo => {
              // Limpar URL anterior se existir
              if (prevVideo?.url) {
                URL.revokeObjectURL(prevVideo.url);
              }
              
              return {
                blob,
                url,
                duration: Math.floor(duration / 1000),
                size: blob.size,
                thumbnail
              };
            });
          } catch (err) {
            console.error('Erro ao capturar thumbnail:', err);
            setRecordedVideo(prevVideo => {
              // Limpar URL anterior se existir
              if (prevVideo?.url) {
                URL.revokeObjectURL(prevVideo.url);
              }
              
              return {
                blob,
                url,
                duration: Math.floor(duration / 1000),
                size: blob.size
              };
            });
          }
        }, 500);
        
        // Limpar chunks após criar o blob
        chunksRef.current = [];
      };

      mediaRecorder.onerror = (event) => {
        console.error('Erro no MediaRecorder:', event);
        setError('Erro durante a gravação');
        setIsRecording(false);
      };

      mediaRecorder.start(1000); // Coleta dados a cada 1 segundo para melhor compatibilidade
      setIsRecording(true);
      startTimeRef.current = Date.now();
      setRecordingTime(0);

      console.log('Gravação iniciada em:', new Date(startTimeRef.current).toLocaleTimeString());

      // Timer para atualizar o tempo de gravação
      timerRef.current = setInterval(() => {
        if (startTimeRef.current > 0) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          console.log('Tempo decorrido:', elapsed);
          setRecordingTime(elapsed);
        }
      }, 1000);

    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      setError('Erro ao iniciar a gravação. Tente novamente.');
    }
  }, [startPreview, captureFirstFrame]);

  const stopRecording = useCallback(() => {
    console.log('Tentando parar gravação...', { 
      isRecording, 
      mediaRecorderState: mediaRecorderRef.current?.state,
      startTime: startTimeRef.current 
    });
    
    if (mediaRecorderRef.current && isRecording) {
      try {
        const recordingDuration = Date.now() - startTimeRef.current;
        console.log('Duração da gravação:', recordingDuration, 'ms');
        
        // Verificar se a gravação tem pelo menos 500ms (reduzido de 1000ms)
        if (recordingDuration < 500) {
          setError('Gravação muito curta. Tente gravar por mais tempo.');
          setIsRecording(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return;
        }
        
        if (mediaRecorderRef.current.state === 'recording') {
          console.log('Parando MediaRecorder...');
          mediaRecorderRef.current.stop();
        } else {
          console.log('MediaRecorder não está gravando:', mediaRecorderRef.current.state);
        }
        
        setIsRecording(false);
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } catch (err) {
        console.error('Erro ao parar gravação:', err);
        setError('Erro ao parar a gravação');
        setIsRecording(false);
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }
  }, [isRecording]);

  const switchCamera = useCallback(async () => {
    if (!isPreviewing) return;
    
    const currentStream = streamRef.current;
    if (!currentStream) return;

    try {
      // Parar o stream atual
      currentStream.getTracks().forEach(track => track.stop());

      // Detectar a câmera atual
      const videoTrack = currentStream.getVideoTracks()[0];
      const currentFacingMode = videoTrack.getSettings().facingMode;
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

      // Iniciar novo stream com a outra câmera
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: newFacingMode
        },
        audio: true
      });

      streamRef.current = newStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Erro ao trocar câmera:', err);
      // Se falhar, tentar voltar para a câmera original
      startPreview();
    }
  }, [isPreviewing, startPreview]);

  const clearRecording = useCallback(() => {
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo.url);
      setRecordedVideo(null);
    }
  }, [recordedVideo]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const downloadVideo = useCallback(() => {
    if (!recordedVideo) return;
    
    try {
      const a = document.createElement('a');
      a.href = recordedVideo.url;
      a.download = `video_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Erro ao baixar vídeo:', err);
      setError('Erro ao baixar o vídeo');
    }
  }, [recordedVideo]);

  // Cleanup ao desmontar o componente
  const cleanup = useCallback(() => {
    stopRecording();
    stopPreview();
    clearRecording();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [stopRecording, stopPreview, clearRecording]);

  return {
    // Estado
    isRecording,
    isPreviewing,
    recordingTime,
    recordedVideo,
    error,
    
    // Refs
    videoRef,
    
    // Funções
    startPreview,
    stopPreview,
    startRecording,
    stopRecording,
    switchCamera,
    clearRecording,
    cleanup,
    downloadVideo,
    
    // Utilitários
    formatTime,
    formatFileSize,
    
    // Estado da câmera
    hasCamera: !!streamRef.current,
    isSupported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  };
}