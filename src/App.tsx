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

import React, {useState} from "react";
import s from './style.module.css'
import Preloader from "./components/Preloader";
import Login from "./pages/Login";
import Info from "./pages/Info";
import Main from "./pages/Main";
import Chart from "./pages/Chart";

setupIonicReact();

const App: React.FC = () => {
  const [page, setPage] = useState(-1)
  const [userId, setUserId] = useState(0)
  const [siteList, setSiteList] = useState([]);
  const [siteId, setSiteId] = useState('')
  const [siteName, setSiteName] = useState('')

  return (
    <IonApp>
      <div>
        {page === -1 ?
          <div>
            <IonReactRouter>
              <Route exact path="/">
                <Redirect to="/login"/>
              </Route>
              <Route exact path="/login">
                <Login setPage={setPage} setUserId={setUserId} />
              </Route>
            </IonReactRouter>
          </div>
          : page === 0
          ?
          <div>
            <Preloader/>
              <IonReactRouter>
                <IonTabs>
                  <IonRouterOutlet>
                    <Route exact path="/login">
                      <Login setPage={setPage} setUserId={setUserId} />
                    </Route>
                    <Route exact path="/info">
                      <Info />
                    </Route>
                    <Route exact path="/main">
                      <Redirect to="/login"/>
                    </Route>
                    <Route exact path="/chart">
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
          </div>
          : page === 1
          ?
          <div>
            <IonReactRouter>
              <Route exact path="/login">
                <Redirect to="/main"/>
              </Route>
              <Route exact path="/chart">
                <Redirect to="/main"/>
              </Route>
              <Route exact path="/main">
                <Main setPage={setPage} userId={userId} siteList={siteList} setSiteList={setSiteList} setSiteId={setSiteId} setSiteName={setSiteName} />
              </Route>
            </IonReactRouter>
            </div>
          : page === 2 &&
            <div>
              <IonReactRouter>
                <Route exact path="/main">
                  <Redirect to="/chart"/>
                </Route>
                <Route exact path="/chart">
                  <Chart setPage={setPage} siteList={siteList} setSiteList={setSiteList} siteId={siteId} siteName={siteName} userId={userId} />
                </Route>
              </IonReactRouter>
            </div>
        }
      </div>
    </IonApp>
  );
};

export default App;