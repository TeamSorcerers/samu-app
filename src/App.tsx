import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home, videocam, heart, chatbubbles } from 'ionicons/icons';
import { HomeVideos } from './pages/HomeVideos';
import { VideoRecorder } from './pages/VideoRecorder';
import { Favorites } from './pages/Favorites';
import { Messages } from './pages/Messages';
import { AppProvider } from './contexts/AppContext';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
/* import '@ionic/react/css/palettes/dark.system.css'; */

/* Theme variables */
import './theme/variables.css';
import './theme/header-override.css';

setupIonicReact();

export function App(){
  return (
  <IonApp>
    <AppProvider>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/messages">
              <Messages/>
            </Route>
            <Route exact path="/home">
              <HomeVideos />
            </Route>
            <Route exact path="/recorder">
              <VideoRecorder />
            </Route>
            <Route path="/favorites">
              <Favorites />
            </Route>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/home">
              <IonIcon aria-hidden="true" icon={home} />
            </IonTabButton>
            <IonTabButton tab="recorder" href="/recorder">
              <IonIcon aria-hidden="true" icon={videocam} />
            </IonTabButton>
            <IonTabButton tab="favorites" href="/favorites">
              <IonIcon aria-hidden="true" icon={heart} />
            </IonTabButton>
            <IonTabButton tab='messages' href='/messages'>
              <IonIcon aria-hidden="true" icon={chatbubbles}/>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </AppProvider>
  </IonApp>
  )
}
