import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonList,
  IonText,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCheckbox,
  IonActionSheet,
  IonSegment,
  IonSegmentButton,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { 
  heart, 
  trash, 
  share, 
  download,
  list,
  grid,
  funnel,
  ellipsisVertical 
} from 'ionicons/icons';
import { useState } from 'react';
import { VideoCard } from '../components/VideoCard';
import { useApp } from '../contexts/AppContext';
import './Tab3.css';

export function Tab3(){
  const { favoriteVideos, removeFromFavorites } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  const handleSelectVideo = (videoId: string, checked: boolean) => {
    if (checked) {
      setSelectedVideos(prev => [...prev, videoId]);
    } else {
      setSelectedVideos(prev => prev.filter(id => id !== videoId));
    }
  };

  const handleRemoveSelected = () => {
    selectedVideos.forEach(videoId => {
      removeFromFavorites(videoId);
    });
    setSelectedVideos([]);
  };

  const sortedVideos = [...favoriteVideos].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'channel':
        return a.channel.localeCompare(b.channel);
      case 'duration':
        return a.duration.localeCompare(b.duration);
      default:
        return 0;
    }
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>Meus Favoritos</IonTitle>
          <IonButton 
            slot="end" 
            fill="clear" 
            onClick={() => setShowActionSheet(true)}
          >
            <IonIcon icon={ellipsisVertical} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Meus Favoritos</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        {favoriteVideos.length === 0 ? (
          <div className="empty-favorites">
            <IonCard>
              <IonCardContent className="empty-content">
                <IonIcon icon={heart} size="large" color="medium" />
                <IonText color="medium">
                  <h2>Nenhum vídeo favoritado</h2>
                  <p>Adicione vídeos aos seus favoritos tocando no ❤️</p>
                </IonText>
              </IonCardContent>
            </IonCard>
          </div>
        ) : (
          <>
            <div className="favorites-header">
              <div className="view-controls">
                <IonSegment
                  value={viewMode}
                  onIonChange={(e) => setViewMode(e.detail.value as 'list' | 'grid')}
                >
                  <IonSegmentButton value="list">
                    <IonIcon icon={list} />
                  </IonSegmentButton>
                  <IonSegmentButton value="grid">
                    <IonIcon icon={grid} />
                  </IonSegmentButton>
                </IonSegment>
              </div>

              <div className="sort-controls">
                <IonButton 
                  size="small" 
                  fill="outline"
                  onClick={() => setShowActionSheet(true)}
                >
                  <IonIcon icon={funnel} slot="start" />
                  Ordenar
                </IonButton>
              </div>
            </div>

            {selectedVideos.length > 0 && (
              <div className="selection-toolbar">
                <IonText>{selectedVideos.length} selecionados</IonText>
                <div className="selection-actions">
                  <IonButton size="small" color="danger" onClick={handleRemoveSelected}>
                    <IonIcon icon={trash} slot="start" />
                    Remover
                  </IonButton>
                  <IonButton size="small" fill="outline">
                    <IonIcon icon={share} slot="start" />
                    Compartilhar
                  </IonButton>
                </div>
              </div>
            )}

            <div className={`favorites-content ${viewMode}`}>
              {viewMode === 'list' ? (
                <IonList>
                  {sortedVideos.map((video) => (
                    <div key={video.id} className="favorite-item">
                      <IonCheckbox
                        checked={selectedVideos.includes(video.id)}
                        onIonChange={(e) => handleSelectVideo(video.id, e.detail.checked)}
                        className="selection-checkbox"
                      />
                      <VideoCard video={video} showFavoriteButton={true} />
                    </div>
                  ))}
                </IonList>
              ) : (
                <IonGrid>
                  <IonRow>
                    {sortedVideos.map((video) => (
                      <IonCol key={video.id} size="6" sizeMd="4" sizeLg="3">
                        <div className="grid-item">
                          <IonCheckbox
                            checked={selectedVideos.includes(video.id)}
                            onIonChange={(e) => handleSelectVideo(video.id, e.detail.checked)}
                            className="grid-checkbox"
                          />
                          <VideoCard video={video} showFavoriteButton={true} />
                        </div>
                      </IonCol>
                    ))}
                  </IonRow>
                </IonGrid>
              )}
            </div>
          </>
        )}

        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          header="Opções"
          buttons={[
            {
              text: 'Ordenar por título',
              handler: () => setSortBy('title')
            },
            {
              text: 'Ordenar por canal',
              handler: () => setSortBy('channel')
            },
            {
              text: 'Ordenar por duração',
              handler: () => setSortBy('duration')
            },
            {
              text: 'Baixar favoritos',
              icon: download,
              handler: () => console.log('Download favoritos')
            },
            {
              text: 'Compartilhar lista',
              icon: share,
              handler: () => console.log('Compartilhar lista')
            },
            {
              text: 'Cancelar',
              role: 'cancel'
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
}
