import {Route, Redirect, useLocation} from 'react-router-dom';
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
import DataListPage from "./pages/DataList";
import { AppProvider, useAppContext } from "./context/AppContext";
import { createUserId } from "./types";
import './App.css'
import {BudgetEditorTab} from "./pages/BudgetLinesEditor/components/BudgetEditorTab";

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
    pushToNavigationHistory,
    popFromNavigationHistory,
    budgetEditorReturnPage,
    setBudgetEditorReturnPage,
    logout,
  } = useAppContext();

  const history = useHistory();
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);
  const pageRef = React.useRef(page);
  pageRef.current = page;
  const isNavigatingBackRef = React.useRef(false);
  const lastPopstateNavRef = React.useRef(0);
  // currentPathRef tracks path from the last render — gives us path BEFORE a popstate fires
  const currentPathRef = React.useRef(window.location.pathname);
  // logoutRef always points to the latest logout function without needing it in effect deps
  const logoutRef = React.useRef(logout);

  useEffect(() => {
    const unlisten = history.listen((location) => {
      setCurrentPath(location.pathname);
    });
    return () => unlisten();
  }, [history]);

  // Keep refs fresh so handlers always use latest values without re-registering effects
  useEffect(() => {
    currentPathRef.current = currentPath;
  }, [currentPath]);

  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  // Sync currentPath when URL changes outside of history.listen (e.g. after logout)
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, [userId, page]);

  // Push browser history entry when entering pages outside the IonReactRouter
  // This ensures the browser back button has something to pop
  // Only push on forward navigation, not when navigating back (popstate)
  useEffect(() => {
    if (page >= 1 && page <= 7 && !isNavigatingBackRef.current) {
      window.history.pushState({ appPage: page }, '');
      console.log('[NAV] pushState for page', page, 'history.length:', window.history.length);
    } else {
      console.log('[NAV] SKIP pushState for page', page, 'isBack:', isNavigatingBackRef.current, 'history.length:', window.history.length);
    }
    isNavigatingBackRef.current = false;
  }, [page]);

  // Handle browser/device back button (popstate) to sync page state with URL
  // Uses pageRef to always access the latest page value (avoids stale closures)
  useEffect(() => {
    const handlePopState = () => {
      const currentPage = pageRef.current;
      const now = Date.now();
      const timeSinceLast = now - lastPopstateNavRef.current;
      console.log('[NAV] popstate fired, currentPage:', currentPage, 'URL:', window.location.pathname, 'timeSinceLast:', timeSinceLast, 'history.length:', window.history.length);

      // If user is not logged in, block ALL back navigation immediately (before debounce)
      if (Number(userId) === 0) {
        console.log('[NAV] → blocked: not logged in');
        // pushState (not replaceState) adds a new /login entry on top of the stack,
        // so every back swipe is intercepted — user can never reach a /menu entry
        window.history.pushState(null, '', '/AgriNET/login');
        history.replace('/login');
        setPage(0);
        return;
      }

      // Debounce: ignore popstate events within 500ms of a navigation we already handled
      if (timeSinceLast < 500) {
        // Fix URL if it drifted (e.g. browser popped extra entry)
        window.history.replaceState(null, '', '/AgriNET/menu');
        return;
      }

      // Clear any stale modal-handled flag from previous events
      (window as any).__popstateHandledByModal = false;

      // On menu page, back = logout (same as clicking the logout button)
      // currentPathRef.current has the path BEFORE this popstate (updated after render, not yet refreshed)
      const pathBeforePop = currentPathRef.current.replace('/AgriNET', '');
      if (currentPage === 0 && pathBeforePop === '/menu') {
        logoutRef.current();
        window.history.pushState(null, '', '/AgriNET/login');
        window.history.pushState(null, '', '/AgriNET/login');
        history.replace('/login');
        return;
      }

      // Handle page navigation FIRST (before URL checks)
      // Pages 2-4 (Chart, VirtualValve, AddValve) → back to Map
      if (currentPage === 2 || currentPage === 3 || currentPage === 4) {
        lastPopstateNavRef.current = now;
        isNavigatingBackRef.current = true;
        pageRef.current = 1;
        setPage(1);
        window.history.replaceState(null, '', '/AgriNET/map');
        // Push guard entry to absorb stale history entries
        window.history.pushState(null, '', '/AgriNET/map');
        return;
      }
      // Pages 5-7 (Comments, AddUnit, DataList) → back to Menu
      if (currentPage === 5 || currentPage === 6 || currentPage === 7) {
        lastPopstateNavRef.current = now;
        isNavigatingBackRef.current = true;
        pageRef.current = 0;
        setPage(0);
        window.history.replaceState(null, '', '/AgriNET/menu');
        // Push guard entry to absorb stale history entries
        window.history.pushState(null, '', '/AgriNET/menu');
        return;
      }

      // Block going back to login when logged in — undo the back navigation
      const currentUrl = window.location.pathname.replace('/AgriNET', '');
      if (currentUrl === '/login' || currentUrl === '' || currentUrl === '/') {
        window.history.pushState(null, '', '/AgriNET/menu');
        window.history.pushState(null, '', '/AgriNET/menu');
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setPage, userId]);

  // Handle Capacitor/Ionic hardware back button (Android, iOS)
  // Priority 5 (lowest) — Chart modals (20) and Map views (10) handle first
  // Uses pageRef to always access the latest page value (avoids stale closures)
  useEffect(() => {
    const handler = (ev: any) => {
      ev.detail.register(5, () => {
        const currentPage = pageRef.current;

        // If user is not logged in, stay on login
        if (Number(userId) === 0) {
          return;
        }

        // Pages 2-4 (Chart, VirtualValve, AddValve) → back to Map
        if (currentPage === 2 || currentPage === 3 || currentPage === 4) {
          isNavigatingBackRef.current = true;
          pageRef.current = 1;
          window.history.replaceState(null, '', '/AgriNET/map');
          setPage(1);
        }
        // Pages 5-7 (Comments, AddUnit, DataList) → back to Menu
        else if (currentPage === 5 || currentPage === 6 || currentPage === 7) {
          isNavigatingBackRef.current = true;
          pageRef.current = 0;
          window.history.replaceState(null, '', '/AgriNET/menu');
          setPage(0);
        }
        // Page 0: handle Budget, Info, and Menu → Logout
        else if (currentPage === 0) {
          const path = window.location.pathname.replace('/AgriNET', '');
          // On menu page, back button = logout
          if (path === '/menu') {
            logoutRef.current();
            history.replace('/login');
            window.history.pushState(null, '', '/AgriNET/login');
            window.history.pushState(null, '', '/AgriNET/login');
            return;
          }
          if (path === '/login') {
            return;
          }
          if (path === '/budget' || path === '/info') {
            const previousPage = popFromNavigationHistory();
            if (previousPage) {
              window.history.replaceState(null, '', '/AgriNET' + previousPage.path);
              if (previousPage.page !== 0) {
                setPage(previousPage.page);
              } else {
                history.push(previousPage.path);
              }
              if (previousPage.path === '/chart') {
                setBudgetEditorReturnPage(null);
              }
            } else if (path === '/budget' && budgetEditorReturnPage === 'chart') {
              setBudgetEditorReturnPage(null);
              setPage(2);
              window.history.replaceState(null, '', '/AgriNET/chart');
            } else {
              history.push('/menu');
            }
          }
        }
      });
    };

    document.addEventListener('ionBackButton', handler);
    return () => document.removeEventListener('ionBackButton', handler);
  }, [setPage, userId]);

  useEffect(() => {
    loadGoogleApi(setGoogleApiLoaded);

    // Check for stored session
    const storedUserId = localStorage.getItem('userId');
    const storedUserData = localStorage.getItem('userData');

    if (storedUserId && storedUserData) {
      // User has a stored session, auto-login
      const parsedUserId = parseInt(storedUserId);
      setUserId(createUserId(parsedUserId));
      setPage(0);
      history.replace('/AgriNET/menu');
      // Push extra entry so device back button stays on menu
      setTimeout(() => window.history.pushState(null, '', '/AgriNET/menu'), 100);
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
                      <Route exact path="/budget">
                        <BudgetEditorTab siteList={siteList} userId={userId} isGoogleApiLoaded={isGoogleApiLoaded} />
                      </Route>
                      <Route exact path="/">
                        <Redirect to="/menu" />
                      </Route>
                    </IonRouterOutlet>
                    {currentPath.includes('/datalist') ? (
                      <IonTabBar slot="bottom" style={{ display: 'none' }} />
                    ) : (
                      <IonTabBar slot="bottom">
                        <IonTabButton tab="menu" layout="icon-start" href={Number(userId) === 0 ? '/login' : '/menu'} onClick={() => {
                          const currentPath = window.location.pathname.replace('/AgriNET', '');
                          pushToNavigationHistory(currentPath, page);
                        }}>
                          <IonIcon icon={home}/>
                        </IonTabButton>
                        <IonTabButton tab="budget" href="/budget" style={Number(userId) === 0 ? { display: 'none' } : undefined} onClick={() => {
                          const currentPath = window.location.pathname.replace('/AgriNET', '');
                          pushToNavigationHistory(currentPath, page);
                        }}>
                          <IonIcon icon={settings}/>
                        </IonTabButton>
                        <IonTabButton tab="info" href="/info" onClick={() => {
                          const currentPath = window.location.pathname.replace('/AgriNET', '');
                          pushToNavigationHistory(currentPath, page);
                        }}>
                          <IonIcon icon={informationCircle}/>
                        </IonTabButton>
                      </IonTabBar>
                    )}
                  </IonTabs>
                </IonReactRouter>
              </div>
              : page === 2
                ? <div>
                    <Chart additionalChartData={additionalChartData} chartData={chartData} setPage={setPage}
                           siteList={siteList} setSiteList={setSiteList} siteId={siteId} siteName={siteName}
                           userId={userId} chartPageType={chartPageType}
                           setAdditionalChartData={setAdditionalChartData} setChartData={setChartData}
                           setSiteId={setSiteId} setSiteName={setSiteName} setChartPageType={setChartPageType}/>
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
                          <CommentsPage userId={userId} setPage={setPage} />
                        </div>
                      : page === 6
                        ? <div>
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
                          </div>
                        : page === 7
                          ? <div>
                              <DataListPage setPage={setPage} siteList={siteList} />
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
