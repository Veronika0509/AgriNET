import {Redirect, Route, useLocation} from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';
import {home, informationCircle, logoFacebook} from 'ionicons/icons';
import {loadGoogleApi} from "./components/loadGoogleApiFunc";
import { useHistory } from 'react-router-dom';

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

import React, {useEffect, useState} from "react";
import Preloader from "./components/Preloader";
import Login from "./pages/Login";
import Info from "./pages/Info";
import Map from "./pages/Map";
import Chart from "./pages/Chart";
import './App.css'

setupIonicReact();

const App: React.FC = () => {
  const [page, setPage] = useState(0)
  const [userId, setUserId] = useState(0)
  const [siteList, setSiteList] = useState<any[]>([]);
  const [siteId, setSiteId] = useState('')
  const [siteName, setSiteName] = useState('')
  const [chartData, setChartData] = useState([])
  const [linesCount, setLinesCount] = useState(0)
  const [isGoogleApiLoaded, setGoogleApiLoaded] = useState(false);
  const history = useHistory();

  useEffect(() => {
    loadGoogleApi(setGoogleApiLoaded);
    history.push('/AgriNET/login');
  }, []);

  return (
    <div>
      {isGoogleApiLoaded && (
        <IonApp>
          <div>
            {page === 0
                ? <div>
                  <Preloader/>
                  <IonReactRouter basename="/AgriNET">
                    <IonTabs>
                      <IonRouterOutlet>
                        <Route exact path="/login">
                          <Login setPage={setPage} setUserId={setUserId} />
                        </Route>
                        <Route exact path="/info">
                          <Info />
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
                  : page === 2 &&
                    <div>
                      <IonReactRouter basename="/AgriNET">
                        <Route path="/chart">
                          <Chart linesCount={linesCount} chartData={chartData} setPage={setPage} siteList={siteList} setSiteList={setSiteList} siteId={siteId} siteName={siteName} userId={userId} />
                        </Route>
                      </IonReactRouter>
                    </div>
            }
          </div>
          <div style={{display: page === 1 ? 'block' : 'none'}}>
            <Map page={page} isGoogleApiLoaded={isGoogleApiLoaded} chartData={chartData} setChartData={setChartData} setPage={setPage} userId={userId} siteList={siteList} setSiteList={setSiteList} setSiteId={setSiteId} setSiteName={setSiteName} setLinesCount={setLinesCount} />
          </div>
        </IonApp>
      )}
    </div>
  );
};

export default App;