import React, { useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonImg,
  IonText,
  IonButton,
  IonIcon,
  IonAvatar,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons
} from '@ionic/react';
import { heart, heartOutline, play, time, eye, close } from 'ionicons/icons';
import { Video, useApp } from '../contexts/AppContext';
import './VideoCard.css';

interface VideoCardProps {
  video: Video;
  showFavoriteButton?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  showFavoriteButton = true 
}) => {
  const { addToFavorites, removeFromFavorites, isFavorite, getLocalVideoUrl } = useApp();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const isVideoFavorite = isFavorite(video.id);

  const handleFavoriteToggle = () => {
    if (isVideoFavorite) {
      removeFromFavorites(video.id);
    } else {
      addToFavorites(video);
    }
  };

  const handlePlayVideo = async () => {
    if (video.isLocal) {
      // Para vídeos locais, obter URL temporária
      try {
        const url = await getLocalVideoUrl(video.id);
        if (url) {
          setLocalVideoUrl(url);
          setIsVideoModalOpen(true);
        } else {
          console.error('Não foi possível obter URL do vídeo local');
        }
      } catch (error) {
        console.error('Erro ao carregar vídeo local:', error);
      }
    } else if (video.videoUrl) {
      // Para vídeos externos, usar URL direta
      setLocalVideoUrl(video.videoUrl);
      setIsVideoModalOpen(true);
    } else {
      console.warn('Vídeo não possui URL válida');
    }
  };

  const handleCloseModal = () => {
    setIsVideoModalOpen(false);
    // Limpar URL temporária para liberar memória
    if (localVideoUrl && video.isLocal) {
      URL.revokeObjectURL(localVideoUrl);
    }
    setLocalVideoUrl(null);
  };

  return (
    <>
      <IonCard className="video-card">
        <div className="video-thumbnail-container" onClick={handlePlayVideo}>
          <IonImg 
            src={video.thumbnail} 
            alt={video.title}
            className="video-thumbnail"
          />
          <div className="video-duration-overlay">
            <IonText className="video-duration">{video.duration}</IonText>
          </div>
          <div className="video-play-overlay">
            <IonIcon icon={play} className="play-icon" />
          </div>
          {video.isLocal && (
            <div className="local-video-badge">
              <IonText>LOCAL</IonText>
            </div>
          )}
        </div>
        
        <IonCardContent className="video-info">
          <div className="video-header">
            <IonAvatar className="channel-avatar">
              <img src={`https://picsum.photos/40/40?random=${video.id}`} alt="Channel" />
            </IonAvatar>
            <div className="video-details">
              <IonCardTitle className="video-title">{video.title}</IonCardTitle>
              <IonText color="medium" className="channel-name">
                {video.channel}
              </IonText>
            </div>
            {showFavoriteButton && (
              <IonButton 
                fill="clear" 
                size="small"
                onClick={handleFavoriteToggle}
                className="favorite-button"
              >
                <IonIcon 
                  icon={isVideoFavorite ? heart : heartOutline} 
                  color={isVideoFavorite ? "danger" : "medium"}
                />
              </IonButton>
            )}
          </div>
          
          <div className="video-stats">
            <div className="stat-item">
              <IonIcon icon={eye} />
              <IonText>{video.views} visualizações</IonText>
            </div>
            <div className="stat-item">
              <IonIcon icon={time} />
              <IonText>{video.uploadDate}</IonText>
            </div>
          </div>
          
          <IonText color="medium" className="video-description">
            {video.description}
          </IonText>
        </IonCardContent>
      </IonCard>

      {/* Modal de reprodução de vídeo */}
      <IonModal isOpen={isVideoModalOpen} onDidDismiss={handleCloseModal}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{video.title}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleCloseModal}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '16px' }}>
            {localVideoUrl && (
              <video
                controls
                autoPlay
                style={{ 
                  width: '100%', 
                  maxHeight: '70vh', 
                  borderRadius: '8px',
                  backgroundColor: '#000'
                }}
                src={localVideoUrl}
              >
                Seu navegador não suporta reprodução de vídeo.
              </video>
            )}
            
            <div style={{ marginTop: '16px' }}>
              <IonText>
                <h3>{video.title}</h3>
                <p><strong>Canal:</strong> {video.channel}</p>
                <p><strong>Duração:</strong> {video.duration}</p>
                <p><strong>Visualizações:</strong> {video.views}</p>
                <p><strong>Publicado:</strong> {video.uploadDate}</p>
                {video.isLocal && (
                  <p><strong>Tipo:</strong> Vídeo salvo localmente</p>
                )}
                <p>{video.description}</p>
              </IonText>
            </div>
          </div>
        </IonContent>
      </IonModal>
    </>
  );
};