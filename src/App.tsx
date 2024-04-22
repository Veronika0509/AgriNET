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
  const [isGoogleApiLoaded, setGoogleApiLoaded] = useState(false);

  useEffect(() => {
    loadGoogleApi(setGoogleApiLoaded);
  }, []);

  return (
    <div>
      {isGoogleApiLoaded && (
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
                        <Route exact path="/">
                          <Redirect to="/login"/>
                        </Route>
                        <Route exact path="/info">
                          <Info />
                        </Route>
                        <Route exact path="/map">
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
                        <Redirect to="/map"/>
                      </Route>
                      <Route exact path="/chart">
                        <Redirect to="/map"/>
                      </Route>
                    </IonReactRouter>
                  </div>
                  : page === 2 &&
                        <div>
                            <IonReactRouter>
                                <Route exact path="/map">
                                    <Redirect to="/chart"/>
                                </Route>
                                <Route exact path="/chart">
                                    <Chart chartData={chartData} setPage={setPage} siteList={siteList} setSiteList={setSiteList} siteId={siteId} siteName={siteName} userId={userId} />
                                </Route>
                            </IonReactRouter>
                        </div>
            }

          </div>
          <div style={{display: page === 1 ? 'block' : 'none'}}>
            <Map page={page} isGoogleApiLoaded={isGoogleApiLoaded} chartData={chartData} setChartData={setChartData} setPage={setPage} userId={userId} siteList={siteList} setSiteList={setSiteList} setSiteId={setSiteId} setSiteName={setSiteName} />
          </div>
        </IonApp>
      )}
    </div>
  );
};

export default App;