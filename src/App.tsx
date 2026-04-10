import {Route, Redirect} from 'react-router-dom';
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
import { useUrlSync } from "./hooks/useUrlSync";
import { pageToUrl, parseCurrentUrl, isDeepLink, buildUrl } from "./utils/url";

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

  const { restoreFromUrl } = useUrlSync(
    { page, siteId, chartPageType, userId },
    { setPage, setSiteId, setSiteName, setChartData, setAdditionalChartData, setChartPageType, setSiteList, setUserId }
  );

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
      // Update currentPathRef when navigating TO /info or /budget so the popstate
      // handler correctly sees where we came from when the user presses back.
      // We intentionally skip /menu here — IonReactRouter fires internal '/menu'
      // history events during tab animations that would corrupt pathBeforePop.
      const path = location.pathname.replace('/AgriNET', '');
      if (path === '/info' || path === '/budget') {
        currentPathRef.current = location.pathname;
      }
    });
    return () => unlisten();
  }, [history]);

  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  // Sync currentPath (UI state) and currentPathRef (used in popstate handler) when
  // userId or page changes (login/logout/page switch).
  // NOTE: currentPathRef is intentionally NOT updated via history.listen because
  // IonReactRouter fires internal history events (e.g. '/menu') during tab animations
  // that would corrupt the "path before pop" value used for logout detection.
  useEffect(() => {
    setCurrentPath(window.location.pathname);
    currentPathRef.current = window.location.pathname;
  }, [userId, page]);

  // Push browser history entry when entering pages outside the IonReactRouter
  // This ensures the browser back button has something to pop
  // Only push on forward navigation, not when navigating back (popstate)
  useEffect(() => {
    if (page >= 1 && page <= 7 && !isNavigatingBackRef.current) {
      const url = pageToUrl(page, { siteId, chartPageType });
      window.history.pushState({ appPage: page }, '', url || undefined);
      console.log('[NAV] pushState for page', page, 'url:', url, 'history.length:', window.history.length);
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

      // Map page (page 1): Map.tsx has its own popstate handler that manages
      // navigation back to menu. Set the debounce timestamp here so that if
      // Mac fires a spurious second popstate AFTER Map.tsx calls setPage(0)
      // (which re-renders with page=0), the logout condition won't trigger.
      if (currentPage === 1) {
        lastPopstateNavRef.current = now;
        currentPathRef.current = window.location.pathname;
        return;
      }

      // On menu page, back = logout (same as clicking the logout button).
      // pathBeforePop is reliable here because tab button onClick handlers explicitly
      // update currentPathRef.current when navigating to sub-pages (/budget, /info),
      // so we can correctly distinguish "was on /menu" vs "was on /budget".
      const pathBeforePop = currentPathRef.current.replace('/AgriNET', '');
      if (currentPage === 0 && pathBeforePop === '/menu') {
        // Guard: user navigated to /info via the Menu button — the flag was set on click
        // and is immune to currentPathRef being reset by internal IonReactRouter events.
        if ((window as any).__infoFromMenu) {
          (window as any).__infoFromMenu = false;
          window.history.replaceState(null, '', '/AgriNET/menu');
          return;
        }
        // Guard: on Android, ionBackButton (Map → Menu) can trigger a spurious popstate
        // that fires after React commits page=0. Skip logout if we just came from Map.
        if (Date.now() - ((window as any).__mapToMenuTimestamp || 0) < 500) {
          window.history.replaceState(null, '', '/AgriNET/menu');
          return;
        }
        logoutRef.current();
        window.history.pushState(null, '', '/AgriNET/login');
        window.history.pushState(null, '', '/AgriNET/login');
        history.replace('/login');
        return;
      }

      // Handle page navigation FIRST (before URL checks)
      // Pages 2-4 (Chart, VirtualValve, AddValve) → back to Map
      // Matches back arrow behavior exactly: setPage(1) + replaceState, let useEffect([page]) handle pushState
      if (currentPage === 2 || currentPage === 3 || currentPage === 4) {
        pageRef.current = 1;
        setPage(1);
        window.history.replaceState(null, '', buildUrl('/map'));
        // Set timestamp so Map's popstate handler ignores any spurious popstate
        // that may fire after React re-renders with page=1 (Mac back gesture quirk)
        (window as any).__chartToMapNavTimestamp = Date.now();
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

      // If we just navigated naturally to /menu from another page (e.g. /budget or /info),
      // debounce the next popstate. This prevents a spurious second popstate (Mac back
      // gesture can fire twice) from seeing pathBeforePop='/menu' and triggering logout.
      if (currentUrl === '/menu' && pathBeforePop !== '/menu') {
        lastPopstateNavRef.current = now;
        // Flag for ionBackButton handler: if Capacitor fires ionBackButton AFTER popstate
        // (Android), the back navigation is already done — don't trigger logout.
        (window as any).__subpageBackHandledByPopstate = Date.now();
        // Clear infoFromMenu flag: we've successfully returned to /menu.
        (window as any).__infoFromMenu = false;
      }

      // Update currentPathRef so the NEXT popstate has an accurate pathBeforePop.
      // This handles tab navigations where history.listen may not fire.
      currentPathRef.current = window.location.pathname;
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

        // If user is not logged in, navigate back (handles /info → back → /login on Android)
        if (Number(userId) === 0) {
          const path = window.location.pathname.replace('/AgriNET', '');
          if (path !== '/login') {
            window.history.back();
          }
          return;
        }

        // Pages 2-4 (Chart, VirtualValve, AddValve) → back to Map
        if (currentPage === 2 || currentPage === 3 || currentPage === 4) {
          pageRef.current = 1;
          setPage(1);
          window.history.replaceState(null, '', '/AgriNET/map');
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
            // Guard: user navigated to /info via "AgriNET Contact" menu button
            if ((window as any).__infoFromMenu) {
              (window as any).__infoFromMenu = false;
              return;
            }
            // Guard: on Android, Capacitor can fire popstate (which navigates /info→/menu)
            // and then ionBackButton. By the time ionBackButton fires, path is already '/menu'.
            // If popstate already handled the back navigation, skip logout.
            if (Date.now() - ((window as any).__subpageBackHandledByPopstate || 0) < 500) {
              return;
            }
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
              if (previousPage.page !== 0) {
                // Navigate to a non-router page (chart, map, etc.) via setPage
                window.history.replaceState(null, '', '/AgriNET' + previousPage.path);
                setPage(previousPage.page);
                if (previousPage.path === '/chart') {
                  setBudgetEditorReturnPage(null);
                }
              } else {
                // Navigate back within the router (to /menu, /info, etc.)
                // window.history.back() triggers popstate which IonReactRouter handles correctly
                window.history.back();
              }
            } else if (path === '/budget' && budgetEditorReturnPage === 'chart') {
              setBudgetEditorReturnPage(null);
              setPage(2);
              window.history.replaceState(null, '', '/AgriNET/chart');
            } else {
              // Fallback: go back in history (React Router will render /menu)
              window.history.back();
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

      // Check URL synchronously to decide path (avoids React strict mode race)
      const { path } = parseCurrentUrl();
      if (isDeepLink(path)) {
        // Deep link detected — restore state from URL
        restoreFromUrl().then((restored) => {
          if (!restored) {
            // Deep link path not recognized — fallback to menu
            setPage(0);
            history.replace('/menu');
            setTimeout(() => window.history.pushState(null, '', '/AgriNET/menu'), 100);
          }
          setTimeout(() => { setIsInitialLoad(false); }, 500);
        });
      } else {
        // No deep link — go to menu as before
        setPage(0);
        history.replace('/menu');
        setTimeout(() => window.history.pushState(null, '', '/AgriNET/menu'), 100);
        setTimeout(() => { setIsInitialLoad(false); }, 1500);
      }
    } else {
      // No stored session — save deep link target for after login
      const { path } = parseCurrentUrl();
      if (isDeepLink(path)) {
        sessionStorage.setItem('deepLinkTarget', window.location.pathname + window.location.search);
      }
      history.push('/login');
      // Mark initial load as complete after a short delay
      setTimeout(() => {
        setIsInitialLoad(false);
      }, 1500);
    }
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
                        <Menu setPage={setPage} userId={userId} onBeforeNavigateToInfo={() => {
                          currentPathRef.current = '/AgriNET/info';
                          (window as any).__infoFromMenu = true;
                        }} />
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
                          // After navigating to menu, the next back press should trigger logout
                          currentPathRef.current = '/AgriNET/menu';
                        }}>
                          <IonIcon icon={home}/>
                        </IonTabButton>
                        <IonTabButton tab="budget" href="/budget" style={(Number(userId) === 0 || currentPath.endsWith('/login')) ? { display: 'none' } : undefined} onClick={() => {
                          const currentPath = window.location.pathname.replace('/AgriNET', '');
                          pushToNavigationHistory(currentPath, page);
                          // Update currentPathRef so popstate knows we navigated away from /menu
                          currentPathRef.current = '/AgriNET/budget';
                        }}>
                          <IonIcon icon={settings}/>
                        </IonTabButton>
                        <IonTabButton tab="info" href="/info" onClick={() => {
                          const currentPath = window.location.pathname.replace('/AgriNET', '');
                          pushToNavigationHistory(currentPath, page);
                          // Update currentPathRef so popstate knows we navigated away from /menu
                          currentPathRef.current = '/AgriNET/info';
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
          {page >= 1 && Number(userId) !== 0 && (
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: '56px',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              backgroundColor: 'var(--ion-tab-bar-background, #fff)',
              borderTop: '1px solid var(--ion-tab-bar-border-color, #e0e0e0)',
              zIndex: 10000,
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}>
              <button onClick={() => {
                const cp = window.location.pathname.replace('/AgriNET', '');
                pushToNavigationHistory(cp, page);
                setPage(0);
                history.replace('/menu');
                currentPathRef.current = '/AgriNET/menu';
              }} style={{background: 'none', border: 'none', cursor: 'pointer', padding: '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <IonIcon icon={home} style={{fontSize: '24px', color: 'var(--ion-color-primary, #3880ff)'}} />
              </button>
              <button onClick={() => {
                const cp = window.location.pathname.replace('/AgriNET', '');
                pushToNavigationHistory(cp, page);
                setPage(0);
                history.replace('/budget');
                currentPathRef.current = '/AgriNET/budget';
              }} style={{background: 'none', border: 'none', cursor: 'pointer', padding: '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <IonIcon icon={settings} style={{fontSize: '24px', color: '#666'}} />
              </button>
              <button onClick={() => {
                const cp = window.location.pathname.replace('/AgriNET', '');
                pushToNavigationHistory(cp, page);
                setPage(0);
                history.replace('/info');
                currentPathRef.current = '/AgriNET/info';
              }} style={{background: 'none', border: 'none', cursor: 'pointer', padding: '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <IonIcon icon={informationCircle} style={{fontSize: '24px', color: '#666'}} />
              </button>
            </div>
          )}
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
