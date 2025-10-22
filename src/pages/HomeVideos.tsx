import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonIcon,
  IonFab,
  IonFabButton,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  RefresherEventDetail
} from '@ionic/react';
import { useState } from 'react';
import { VideoCard } from '../components/VideoCard';
import { useApp } from '../contexts/AppContext';
import { play } from 'ionicons/icons';
import './HomeVideos.css';

export function HomeVideos(){
  const { videos } = useApp();
  const [searchText, setSearchText] = useState('');

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

  // Dividir vídeos por seções
  const recentVideos = videos.slice(0, 3);
  const recommendedVideos = videos.slice(3, 6);
  const trendingVideos = videos.slice(6, 9);

  return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="samu-custom">
            <IonTitle>
              <img src="/favicon.png" alt="Logo" style={{ height: '28px', verticalAlign: 'middle' }} />
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen class="samu-custom-bg">
          <IonHeader collapse="condense">
            <IonToolbar color="samu-custom">
              <IonTitle size="large">
                <img src="/favicon.png" alt="Logo" style={{ height: '36px', verticalAlign: 'middle' }} />
              </IonTitle>
            </IonToolbar>
          </IonHeader>
          
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent></IonRefresherContent>
          </IonRefresher>

          {/* Barra de busca */}
          <div className="search-container">
            <IonSearchbar
              value={searchText}
              onIonInput={(e) => setSearchText(e.detail.value!)}
              placeholder="Pesquisar vídeos..."
              showClearButton="focus"
            />
          </div>


          {/* Se há busca, mostrar resultados filtrados */}
          {searchText && (
            <>
              <div className="section-title">Resultados para "{searchText}"</div>
              <div className="video-list">
                {filteredVideos.map((video) => (
                  <VideoCard key={`search-${video.id}`} video={video} layout="horizontal" />
                ))}
              </div>
            </>
          )}

          {/* Se não há busca, mostrar seções organizadas */}
          {!searchText && (
            <>
              {/* Seção Recommended */}
              <div className="section-title">Recommended</div>
              <div className="video-grid recommended">
                {recommendedVideos.map((video) => (
                  <VideoCard key={`rec-${video.id}`} video={video} layout="vertical" />
                ))}
              </div>

              {/* Seção Latest */}
              <div className="section-title">Latest</div>
              <div className="video-list recent">
                {recentVideos.map((video) => (
                  <VideoCard key={`recent-${video.id}`} video={video} layout="horizontal" />
                ))}
              </div>

              {/* Seção Trending */}
              <div className="section-title">Trending</div>
              <div className="video-grid trending">
                {trendingVideos.map((video) => (
                  <VideoCard key={`trend-${video.id}`} video={video} layout="vertical" />
                ))}
              </div>
            </>
          )}

          <IonInfiniteScroll>
            <IonInfiniteScrollContent loadingText="Carregando mais vídeos...">
            </IonInfiniteScrollContent>
          </IonInfiniteScroll>

          {/* Botão flutuante de play */}
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton className="play-button" routerLink="/recorder">
              <IonIcon icon={play}></IonIcon>
            </IonFabButton>
          </IonFab>
        </IonContent>
      </IonPage>
  )
}


