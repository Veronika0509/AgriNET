import {Redirect, Route} from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel, IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';
import {ellipse, home, informationCircle, square, triangle} from 'ionicons/icons';

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

/* Theme variables */
// import '../../theme/variables.css';

import {useState} from "react";
import s from './style.module.css'
import Preloader from "./components/Preloader";
import Login from "./pages/Login";
import Info from "./pages/Info";

setupIonicReact();

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div>
      <Preloader setIsLoading={setIsLoading} />
      <IonApp>
        <IonReactRouter>
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/login">
                <Login/>
              </Route>
              <Route exact path="/info">
                <Info/>
              </Route>
              <Route exact path="/">
                <Redirect to="/login"/>
              </Route>
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
              <IonTabButton tab="login" layout="icon-start" href="/login">
                <IonIcon icon={home}/>
              </IonTabButton>
              <IonTabButton tab="info" href="/info">
                <IonIcon icon={informationCircle}/>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonReactRouter>
      </IonApp>
    </div>
  );
};

export default App;
