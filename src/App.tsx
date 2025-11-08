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
import {home, informationCircle} from 'ionicons/icons';
import {loadGoogleApi} from "./functions/loadGoogleApiFunc";
import {useHistory} from 'react-router-dom';
import {getSiteList} from "./pages/Map/data/getSiteList";

// Типы
import type { Site, SensorData, ChartPageType, UserId, SiteId } from './types';

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
import Preloader from "./pages/Login/components/Preloader";
import Login from "./pages/Login";
import Info from "./pages/Info";
import Map from "./pages/Map";
import Chart from "./pages/Chart";
import TestOverlays from "./pages/TestOverlays";
import VirtualValve from "./pages/VirtualValve";
import AddValvePage from "./pages/AddValvePage";
import QRCodeScanner from "./components/QRCodeScanner";
import './App.css'

setupIonicReact();

const App: React.FC = () => {
  const [page, setPage] = useState<number>(0);
  const [userId, setUserId] = useState<UserId>(0 as UserId);
  const [siteList, setSiteList] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState<SiteId>('' as SiteId);
  const [siteName, setSiteName] = useState<string>('');
  const [chartData, setChartData] = useState<SensorData[]>([]);
  const [additionalChartData, setAdditionalChartData] = useState<SensorData[]>([]);
  const [chartPageType, setChartPageType] = useState<ChartPageType>('moist');
  const [isGoogleApiLoaded, setGoogleApiLoaded] = useState<boolean>(false);
  const [mapPageKey, setMapPageKey] = useState<number>(0);
  const [selectedSiteForAddUnit, setSelectedSiteForAddUnit] = useState<string>('');
  const [selectedMoistureSensor, setSelectedMoistureSensor] = useState<any>(null);
  const history = useHistory();

  const reloadMapPage = async (): Promise<void> => {
    // Fetch fresh site list data
    const sites = await getSiteList(userId);

    // Check if API call was successful
    if ('success' in sites && sites.success === false) {
      console.error('Failed to reload site list:', sites.error);
    } else {
      // Update site list with fresh data
      setSiteList(sites.data);
    }

    // Force map component to remount
    setMapPageKey(prevKey => prevKey + 1);
  };

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
                        <Login setPage={setPage} setUserId={setUserId}/>
                      </Route>
                      <Route exact path="/info">
                        <Info showHeader={true} />
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
                      />
                    </div>
                  : page === 4
                    ? <div>
                        <AddValvePage 
                          setPage={setPage} 
                          siteList={siteList} 
                          selectedSite={selectedSiteForAddUnit}
                          selectedMoistureSensor={selectedMoistureSensor}
                        />
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

export default App;
