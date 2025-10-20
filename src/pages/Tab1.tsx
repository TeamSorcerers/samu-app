import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/react';
import { RefresherEventDetail } from '@ionic/core';
import { useState } from 'react';
import { VideoCard } from '../components/VideoCard';
import { useApp } from '../contexts/AppContext';
import './Tab1.css';

export function Tab1(){
  const { videos } = useApp();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchText.toLowerCase()) ||
    video.description.toLowerCase().includes(searchText.toLowerCase()) ||
    video.channel.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    setTimeout(() => {
      event.detail.complete();
    }, 2000);
  };

  return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="dark">
            <IonTitle>Samu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Samu</IonTitle>
            </IonToolbar>
          </IonHeader>
          
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent></IonRefresherContent>
          </IonRefresher>

          <div className="search-container">
            <IonSearchbar
              value={searchText}
              onIonInput={(e) => setSearchText(e.detail.value!)}
              placeholder="Pesquisar vídeos..."
              showClearButton="focus"
            />
          </div>

          <div className="category-filter">
            <IonSegment
              value={selectedCategory}
              onIonChange={(e) => setSelectedCategory(e.detail.value as string)}
            >
              <IonSegmentButton value="todos">
                <IonLabel>Todos</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="trending">
                <IonLabel>Em alta</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="recentes">
                <IonLabel>Recentes</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>

          <IonList>
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </IonList>

          <IonInfiniteScroll>
            <IonInfiniteScrollContent loadingText="Carregando mais vídeos...">
            </IonInfiniteScrollContent>
          </IonInfiniteScroll>
        </IonContent>
      </IonPage>
  )
}


