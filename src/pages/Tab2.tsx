import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonText,
  IonProgressBar,
  IonToast
} from '@ionic/react';
import { 
  videocam, 
  stop, 
  camera,
  trash,
  cloud,
  close
} from 'ionicons/icons';
import { useState, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import './Tab2.css';

export function Tab2(){
  // Estados para gravação simples
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Estados do formulário
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoCategory, setVideoCategory] = useState('tecnologia');
  const [isPublic, setIsPublic] = useState(true);
  const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { addVideo, getLocalVideoUrl } = useApp();

  // Funções auxiliares
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Iniciar câmera
  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Erro ao acessar câmera: ' + (err as Error).message);
    }
  };

  // Iniciar gravação
  const startRecording = () => {
    if (!stream) return;
    
    try {
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      chunksRef.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setIsRecording(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      setError('Erro ao iniciar gravação: ' + (err as Error).message);
    }
  };

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  // Limpar tudo
  const clearRecording = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedVideoUrl(null);
    setVideoTitle('');
    setVideoDescription('');
    setCustomThumbnail(null);
    setUploadProgress(0);
  };

  // Upload de thumbnail
  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomThumbnail(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Publicar vídeo
  const handleUpload = async () => {
    if (!videoTitle.trim() || !recordedVideoUrl || uploadProgress > 0) return;
    
    setUploadProgress(1); // Inicia o progresso para evitar cliques duplos
    
    try {
      // Obter o blob gravado
      const recordedBlob = chunksRef.current.length > 0 
        ? new Blob(chunksRef.current, { type: 'video/webm' })
        : null;

      if (!recordedBlob) {
        throw new Error('Nenhum vídeo gravado encontrado');
      }

      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10 + 5;
        });
      }, 200);

      // Salvar vídeo localmente
      await addVideo({
        title: videoTitle.trim(),
        description: videoDescription.trim() || 'Vídeo gravado pelo usuário',
        thumbnail: customThumbnail || `https://picsum.photos/320/180?random=${Date.now()}`,
        duration: formatTime(recordingTime),
        channel: 'Meu Canal',
        videoUrl: recordedVideoUrl
      }, recordedBlob, videoCategory, isPublic);

      // Finalizar progresso
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setShowSuccessToast(true);
        clearRecording();
      }, 500);

    } catch (error) {
      console.error('Erro ao publicar vídeo:', error);
      setUploadProgress(0);
      setError('Erro ao publicar vídeo: ' + (error as Error).message);
    }
  };

  return(
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>Criar Conteúdo</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="recording-container">
          <IonCard className="camera-preview">
            <IonCardContent>
              <div className="preview-screen">
                {error ? (
                  <div className="error-message">
                    <IonIcon icon={camera} size="large" color="danger" />
                    <IonText color="danger">{error}</IonText>
                    <IonButton size="small" onClick={startCamera}>
                      Tentar Novamente
                    </IonButton>
                  </div>
                ) : stream ? (
                  <>
                    <video
                      ref={videoRef}
                      className="camera-video"
                      autoPlay
                      muted
                      playsInline
                    />
                    {isRecording && (
                      <div className="recording-overlay">
                        <div className="recording-indicator">
                          <div className="recording-dot"></div>
                          <IonText color="light">REC</IonText>
                        </div>
                        <IonText className="recording-time" color="light">
                          {formatTime(recordingTime)}
                        </IonText>
                      </div>
                    )}
                  </>
                ) : recordedVideoUrl ? (
                  <div className="video-preview">
                    <video
                      controls
                      className="recorded-video"
                      src={recordedVideoUrl}
                    />
                    <div className="video-info">
                      <IonText color="medium">
                        <p>Duração: {formatTime(recordingTime)}</p>
                      </IonText>
                    </div>
                  </div>
                ) : (
                  <div className="preview-placeholder">
                    <IonIcon icon={camera} size="large" color="medium" />
                    <IonText color="medium">Toque para ativar a câmera</IonText>
                    <IonButton size="small" onClick={startCamera}>
                      Ativar Câmera
                    </IonButton>
                  </div>
                )}
              </div>
            </IonCardContent>
          </IonCard>

          {/* Formulário de publicação - aparece após gravação */}
          {recordedVideoUrl && (
            <IonCard className="publish-card">
              <IonCardContent>
                <IonText color="dark">
                  <h2>📝 Configurar Publicação</h2>
                </IonText>

                {/* Formulário */}
                <div className="publish-form">
                  <IonItem>
                    <IonLabel position="stacked">Título do vídeo *</IonLabel>
                    <IonInput
                      value={videoTitle}
                      onIonInput={(e) => setVideoTitle(e.detail.value!)}
                      placeholder="Digite um título para seu vídeo..."
                      clearInput={true}
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Descrição (opcional)</IonLabel>
                    <IonTextarea
                      value={videoDescription}
                      onIonInput={(e) => setVideoDescription(e.detail.value!)}
                      placeholder="Descreva seu vídeo..."
                      rows={3}
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Categoria</IonLabel>
                    <IonSelect
                      value={videoCategory}
                      onIonChange={(e) => setVideoCategory(e.detail.value)}
                      placeholder="Escolha uma categoria"
                    >
                      <IonSelectOption value="tecnologia">🔧 Tecnologia</IonSelectOption>
                      <IonSelectOption value="educacao">📚 Educação</IonSelectOption>
                      <IonSelectOption value="entretenimento">🎬 Entretenimento</IonSelectOption>
                      <IonSelectOption value="gaming">🎮 Gaming</IonSelectOption>
                      <IonSelectOption value="musica">🎵 Música</IonSelectOption>
                      <IonSelectOption value="esportes">⚽ Esportes</IonSelectOption>
                      <IonSelectOption value="vlogs">📹 Vlogs</IonSelectOption>
                    </IonSelect>
                  </IonItem>

                  <IonItem>
                    <IonLabel>Tornar vídeo público</IonLabel>
                    <IonToggle 
                      checked={isPublic}
                      onIonChange={(e) => setIsPublic(e.detail.checked)}
                    />
                  </IonItem>
                </div>

                {/* Seção de Thumbnail */}
                <div className="thumbnail-section">
                  <IonText color="dark">
                    <h3>🖼️ Thumbnail (Imagem de Capa)</h3>
                  </IonText>
                  
                  <div className="thumbnail-preview-main">
                    {customThumbnail ? (
                      <div className="thumbnail-selected">
                        <img src={customThumbnail} alt="Thumbnail personalizado" />
                        <IonButton 
                          size="small" 
                          fill="clear" 
                          onClick={() => setCustomThumbnail(null)}
                          className="remove-thumbnail-btn"
                        >
                          <IonIcon icon={close} />
                        </IonButton>
                      </div>
                    ) : (
                      <div className="thumbnail-placeholder">
                        <IonIcon icon={camera} size="large" color="medium" />
                        <IonText color="medium">
                          <p>Clique abaixo para escolher uma imagem de capa</p>
                          <small>Se não escolher, será usada uma imagem aleatória</small>
                        </IonText>
                      </div>
                    )}
                  </div>
                  
                  <IonButton 
                    fill="outline" 
                    expand="block"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="thumbnail-upload-btn"
                  >
                    <IonIcon icon={camera} slot="start" />
                    {customThumbnail ? 'Alterar Imagem de Capa' : 'Escolher Imagem de Capa'}
                  </IonButton>
                  
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleThumbnailUpload}
                  />
                </div>

                {/* Botões principais */}
                <div className="main-actions">
                  <IonButton 
                    expand="block" 
                    size="large"
                    color="success"
                    onClick={handleUpload}
                    disabled={!videoTitle.trim() || uploadProgress > 0}
                    className="publish-btn"
                  >
                    <IonIcon icon={cloud} slot="start" />
                    {uploadProgress > 0 ? `Publicando... ${Math.round(uploadProgress)}%` : 'PUBLICAR VÍDEO'}
                  </IonButton>
                  
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <IonProgressBar value={uploadProgress / 100} color="success" />
                  )}
                  
                  <IonButton 
                    expand="block" 
                    size="large"
                    color="danger" 
                    fill="outline"
                    onClick={clearRecording}
                    disabled={uploadProgress > 0}
                    className="delete-btn"
                  >
                    <IonIcon icon={trash} slot="start" />
                    EXCLUIR VÍDEO
                  </IonButton>
                </div>

                {/* Mensagens de validação */}
                {!videoTitle.trim() && (
                  <IonText color="danger" className="validation-message">
                    <p>⚠️ O título é obrigatório para publicar o vídeo</p>
                  </IonText>
                )}
              </IonCardContent>
            </IonCard>
          )}

          {/* Controles de gravação */}
          <div className="recording-controls">
            {stream && !recordedVideoUrl ? (
              !isRecording ? (
                <IonButton 
                  expand="block" 
                  size="large" 
                  color="danger"
                  onClick={startRecording}
                >
                  <IonIcon icon={videocam} slot="start" />
                  Iniciar Gravação
                </IonButton>
              ) : (
                <IonButton 
                  expand="block" 
                  size="large" 
                  color="dark"
                  onClick={stopRecording}
                >
                  <IonIcon icon={stop} slot="start" />
                  Parar Gravação ({formatTime(recordingTime)})
                </IonButton>
              )
            ) : null}
          </div>
        </div>

        {/* Toast de sucesso */}
        <IonToast
          isOpen={showSuccessToast}
          onDidDismiss={() => setShowSuccessToast(false)}
          message="🎉 Vídeo publicado com sucesso! Confira na aba 'Últimos vídeos'"
          duration={4000}
          color="success"
          position="top"
        />
      </IonContent>
    </IonPage>
  )
}


