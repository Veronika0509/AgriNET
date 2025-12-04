import {Route} from 'react-router-dom';
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
import {home, informationCircle, settings} from 'ionicons/icons';
import {loadGoogleApi} from "./functions/loadGoogleApiFunc";
import {useHistory} from 'react-router-dom';

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

import React, {useEffect} from "react";
import Preloader from "./pages/Login/components/Preloader";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Info from "./pages/Info";
import Map from "./pages/Map";
import Chart from "./pages/Chart";
import TestOverlays from "./pages/TestOverlays";
import VirtualValve from "./pages/VirtualValve";
import AddValvePage from "./pages/AddValvePage";
import CommentsPage from "./pages/Comments";
import AddUnitPage from "./pages/AddUnit";
import BudgetEditorPage from "./pages/BudgetEditor";
import QRCodeScanner from "./components/QRCodeScanner";
import { AppProvider, useAppContext } from "./context/AppContext";
import './App.css'

setupIonicReact();

// Internal application component with access to context
const AppContent: React.FC = () => {
  const {
    page,
    userId,
    siteList,
    siteId,
    siteName,
    chartData,
    additionalChartData,
    chartPageType,
    isGoogleApiLoaded,
    mapPageKey,
    selectedSiteForAddUnit,
    selectedMoistureSensor,
    setPage,
    setUserId,
    setSiteList,
    setSiteId,
    setSiteName,
    setChartData,
    setAdditionalChartData,
    setChartPageType,
    setGoogleApiLoaded,
    setSelectedSiteForAddUnit,
    setSelectedMoistureSensor,
    reloadMapPage,
  } = useAppContext();

  const history = useHistory();
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  useEffect(() => {
    loadGoogleApi(setGoogleApiLoaded);

    // Check for stored session
    const storedUserId = localStorage.getItem('userId');
    const storedUserData = localStorage.getItem('userData');

    if (storedUserId && storedUserData) {
      // User has a stored session, auto-login
      setUserId(parseInt(storedUserId) as UserId);
      history.push('/AgriNET/menu');
    } else {
      // No stored session, go to login
      history.push('/AgriNET/login');
    }

    // Mark initial load as complete after a short delay
    setTimeout(() => {
      setIsInitialLoad(false);
    }, 1500);
  }, []);

  return (
    <div>
      {isGoogleApiLoaded && (
        <IonApp>
          <div>
            {page === 0
              ? <div>
                {isInitialLoad && <Preloader/>}
                <IonReactRouter basename="/AgriNET">
                  <IonTabs>
                    <IonRouterOutlet>
                      <Route exact path="/login">
                        <Login setPage={setPage} setUserId={setUserId}/>
                      </Route>
                      <Route exact path="/menu">
                        <Menu setPage={setPage} userId={userId} />
                      </Route>
                      <Route exact path="/comments">
                        <CommentsPage userId={userId} setPage={setPage} />
                      </Route>
                      <Route exact path="/addunit">
                        <AddUnitPage
                          userId={userId}
                          siteList={siteList}
                          setSiteList={setSiteList}
                          selectedSiteForAddUnit={selectedSiteForAddUnit}
                          setSelectedSiteForAddUnit={setSelectedSiteForAddUnit}
                          setSelectedMoistureSensor={setSelectedMoistureSensor}
                          setPage={setPage}
                          isGoogleApiLoaded={isGoogleApiLoaded}
                        />
                      </Route>
                      <Route exact path="/budget">
                        <BudgetEditorPage
                          userId={userId}
                          siteList={siteList}
                          setSiteList={setSiteList}
                          isGoogleApiLoaded={isGoogleApiLoaded}
                          setPage={setPage}
                        />
                      </Route>
                      <Route exact path="/info">
                        <Info showHeader={true} setPage={setPage} />
                      </Route>
                      <Route exact path="/test-overlays">
                        <TestOverlays />
                      </Route>
                      <Route path="/map">
                        <Map page={page} isGoogleApiLoaded={isGoogleApiLoaded} chartData={chartData} setChartData={setChartData}
                             setPage={setPage} userId={userId} siteList={siteList} setSiteList={setSiteList} setSiteId={setSiteId}
                             setSiteName={setSiteName} setAdditionalChartData={setAdditionalChartData}
                             selectedSiteForAddUnit={selectedSiteForAddUnit} setSelectedSiteForAddUnit={setSelectedSiteForAddUnit}
                             setChartPageType={setChartPageType} key={mapPageKey} reloadMapPage={reloadMapPage} />
                      </Route>
                      <Route path="/layers">
                        <Map page={page} isGoogleApiLoaded={isGoogleApiLoaded} chartData={chartData} setChartData={setChartData}
                             setPage={setPage} userId={userId} siteList={siteList} setSiteList={setSiteList} setSiteId={setSiteId}
                             setSiteName={setSiteName} setAdditionalChartData={setAdditionalChartData}
                             selectedSiteForAddUnit={selectedSiteForAddUnit} setSelectedSiteForAddUnit={setSelectedSiteForAddUnit}
                             setChartPageType={setChartPageType} key={mapPageKey} reloadMapPage={reloadMapPage} />
                      </Route>
                      <Route path="/settings">
                        <Map page={page} isGoogleApiLoaded={isGoogleApiLoaded} chartData={chartData} setChartData={setChartData}
                             setPage={setPage} userId={userId} siteList={siteList} setSiteList={setSiteList} setSiteId={setSiteId}
                             setSiteName={setSiteName} setAdditionalChartData={setAdditionalChartData}
                             selectedSiteForAddUnit={selectedSiteForAddUnit} setSelectedSiteForAddUnit={setSelectedSiteForAddUnit}
                             setChartPageType={setChartPageType} key={mapPageKey} reloadMapPage={reloadMapPage} />
                      </Route>
                    </IonRouterOutlet>
                    <IonTabBar slot="bottom">
                      <IonTabButton tab="menu" layout="icon-start" href="/menu">
                        <IonIcon icon={home}/>
                      </IonTabButton>
                      <IonTabButton tab="budget" href="/budget">
                        <IonIcon icon={settings}/>
                      </IonTabButton>
                      <IonTabButton tab="info" href="/info">
                        <IonIcon icon={informationCircle}/>
                      </IonTabButton>
                    </IonTabBar>
                  </IonTabs>
                </IonReactRouter>
              </div>
              : page === 2
                ? <div>
                    <IonReactRouter basename="/AgriNET">
                        <Route path="/chart">
                            <Chart additionalChartData={additionalChartData} chartData={chartData} setPage={setPage}
                                   siteList={siteList} setSiteList={setSiteList} siteId={siteId} siteName={siteName}
                                   userId={userId} chartPageType={chartPageType}
                                   setAdditionalChartData={setAdditionalChartData} setChartData={setChartData}
                                   setSiteId={setSiteId} setSiteName={setSiteName} setChartPageType={setChartPageType}/>
                        </Route>
                    </IonReactRouter>
                  </div>
                : page === 3
                  ? <div>
                      <VirtualValve
                        setPage={setPage}
                        siteList={siteList}
                        selectedSite={selectedSiteForAddUnit}
                        selectedMoistureSensor={selectedMoistureSensor}
                        setSelectedMoistureSensor={setSelectedMoistureSensor}
                        userId={userId}
                      />
                    </div>
                  : page === 4
                    ? <div>
                        <AddValvePage
                          setPage={setPage}
                          siteList={siteList}
                          selectedSite={selectedSiteForAddUnit}
                          selectedMoistureSensor={selectedMoistureSensor}
                          userId={userId}
                        />
                      </div>
                    : page === 5
                      ? <div>
                          <IonReactRouter basename="/AgriNET">
                            <Route path="/comments">
                              <CommentsPage userId={userId} setPage={setPage} />
                            </Route>
                          </IonReactRouter>
                        </div>
                      : page === 6
                        ? <div>
                            <IonReactRouter basename="/AgriNET">
                              <Route path="/addunit">
                                <AddUnitPage
                                  userId={userId}
                                  siteList={siteList}
                                  setSiteList={setSiteList}
                                  selectedSiteForAddUnit={selectedSiteForAddUnit}
                                  setSelectedSiteForAddUnit={setSelectedSiteForAddUnit}
                                  setSelectedMoistureSensor={setSelectedMoistureSensor}
                                  setPage={setPage}
                                  isGoogleApiLoaded={isGoogleApiLoaded}
                                />
                              </Route>
                            </IonReactRouter>
                          </div>
                        : page === 7
                          ? <div>
                              <IonReactRouter basename="/AgriNET">
                                <Route path="/budget">
                                  <BudgetEditorPage
                                    userId={userId}
                                    siteList={siteList}
                                    setSiteList={setSiteList}
                                    isGoogleApiLoaded={isGoogleApiLoaded}
                                    setPage={setPage}
                                  />
                                </Route>
                              </IonReactRouter>
                            </div>
                          : null
            }
          </div>
          <div style={{display: page === 1 ? 'block' : 'none'}}>
            <Map page={page} isGoogleApiLoaded={isGoogleApiLoaded} chartData={chartData} setChartData={setChartData}
                 setPage={setPage} userId={userId} siteList={siteList} setSiteList={setSiteList} setSiteId={setSiteId}
                 setSiteName={setSiteName} setAdditionalChartData={setAdditionalChartData}
                 selectedSiteForAddUnit={selectedSiteForAddUnit} setSelectedSiteForAddUnit={setSelectedSiteForAddUnit}
                 setChartPageType={setChartPageType} key={mapPageKey} reloadMapPage={reloadMapPage}
                 setSelectedMoistureSensor={setSelectedMoistureSensor} />
          </div>
        </IonApp>
      )}
    </div>
  );
};

// Main App component with Provider
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
