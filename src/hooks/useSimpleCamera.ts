import { useState, useRef, useCallback } from 'react';

export function useSimpleCamera() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      console.log('Solicitando acesso à câmera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      console.log('Câmera ativada com sucesso');
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      setError('Erro ao acessar a câmera');
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!streamRef.current) {
      await startCamera();
      if (!streamRef.current) return;
    }

    try {
      console.log('Iniciando gravação...');
      chunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        console.log('Dados recebidos:', event.data.size);
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Gravação parada, processando...');
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        console.log('Vídeo criado:', blob.size, 'bytes');
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // Timer simples
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingTime(elapsed);
        console.log('Tempo:', elapsed);
      }, 1000);

    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      setError('Erro ao iniciar gravação');
    }
  }, [startCamera]);

  const stopRecording = useCallback(() => {
    console.log('Parando gravação...');
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [isRecording]);

  const reset = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    
    setIsRecording(false);
    setRecordingTime(0);
    setError(null);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [videoUrl]);

  return {
    isRecording,
    recordingTime,
    videoUrl,
    error,
    videoRef,
    startCamera,
    startRecording,
    stopRecording,
    reset
  };
}