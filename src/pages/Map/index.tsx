"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import {
  IonPage,
  IonContent,
  useIonToast,
} from "@ionic/react"
import SensorModal from "./components/modals/SensorModal"
import { NewLayerModal } from "./components/modals/NewLayerModal"
import { useHistory } from "react-router-dom"
import type { Site, SensorData, ChartPageType, UserId, SiteId } from "../../types"
import type { LayerListLayer, SiteWithLayers, Coordinate } from "./types"
import type { OverlayItem } from "./types/OverlayItem"
import Header from "./components/Header"
import { getSiteList } from "./data/getSiteList"
import { createMap } from "./functions/createMap"
import { createSites } from "./functions/createSites"
import { CollisionResolver } from "./components/CollisionResolver"
import s from "./style.module.css"
// Tab components
import { MapTab } from "./components/tabs/MapTab"
import { InfoTab } from "./components/tabs/InfoTab"
// Custom hooks
import { useUserLocation } from "./hooks/useUserLocation"
import { useMarkerClickCleanup } from "./hooks/useMarkerClickCleanup"
import { useLayers } from "./hooks/useLayers"
import { useChartOverlays } from "./hooks/useChartOverlays"
import { useLayerCreation } from "./hooks/useLayerCreation"
import { useCollisionResolution } from "./hooks/useCollisionResolution"
import { useMapVisibility } from "./hooks/useMapVisibility"
import { loadLayerPreferences, saveLayerPreferences } from "../../utils/chartPreferences"

interface MapProps {
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  userId: UserId
  siteList: Site[]
  setSiteList: React.Dispatch<React.SetStateAction<Site[]>>
  setSiteId: React.Dispatch<React.SetStateAction<SiteId>>
  setSiteName: React.Dispatch<React.SetStateAction<string>>
  setChartData: React.Dispatch<React.SetStateAction<SensorData[]>>
  chartData: SensorData[]
  isGoogleApiLoaded: boolean
  setAdditionalChartData: React.Dispatch<React.SetStateAction<SensorData[]>>
  setChartPageType: React.Dispatch<React.SetStateAction<ChartPageType>>
  key: number
  reloadMapPage?: () => Promise<void>
  selectedSiteForAddUnit: string
  setSelectedSiteForAddUnit: React.Dispatch<React.SetStateAction<string>>
  setSelectedMoistureSensor?: (sensor: any) => void
}

const MapPage: React.FC<MapProps> = (props) => {
  if (!props.reloadMapPage) {
  }
  const present = useIonToast()
  const [activeTab, setActiveTab] = useState("map")
  const [navigationHistory, setNavigationHistory] = useState<string[]>(["map"])
  const [isMarkerClicked, setIsMarkerClicked] = useState<string | boolean>(false)
  const mapRefFunc = useRef(null);
  const previousTabRef = useRef("map")
  const previousPageRef = useRef(props.page)

  // Layer list state for mobile menu icon
  const [layerListState, setLayerListState] = useState({
    isMobileScreen: false,
    isLayerListVisible: true,
    hasLayersToShow: false,
    toggleLayerList: () => {},
  })

  // Keep layers state - it's shared with Map tab (using custom hook)
  const { layers, setLayers, setLayerMapping } = useLayers()

  // Layer creation (using custom hook)
  const {
    isNewLayerModalOpen,
    setIsNewLayerModalOpen,
    newLayerName,
    setNewLayerName,
    newLayerMarkerType,
    setNewLayerMarkerType,
    newLayerTable,
    setNewLayerTable,
    newLayerColumn,
    setNewLayerColumn,
    handleFinishNewLayer,
  } = useLayerCreation({
    layers,
    setLayers,
    setLayerMapping,
  })

  // Sensor modal state (shared)
  const [isSensorModalOpen, setIsSensorModalOpen] = useState(false)
  const [selectedSensor, setSelectedSensor] = useState<any>(null)
  const [availableSensors, _setAvailableSensors] = useState<any[]>([])

  const handleCloseSensorModal = useCallback(() => {
    setIsSensorModalOpen(false)
  }, [])

  const handleSensorSelect = useCallback(
    (sensor: any) => {
      setSelectedSensor(sensor)
      setIsSensorModalOpen(false)

      // Сохраняем выбранный сенсор в глобальном состоянии и переходим на VirtualValve страницу
      props.setSelectedMoistureSensor?.(sensor)
      props.setPage(3)
    },
    [props],
  )
  // All Types
  const [allCoordinatesOfMarkers, setAllCoordinatesOfMarkers] = useState<Coordinate[]>([])
  const [activeOverlays, setActiveOverlays] = useState<OverlayItem[]>([])
  const [allOverlays, setAllOverlays] = useState<OverlayItem[]>([])
  const [coordinatesForFitting, setCoordinatesForFitting] = useState<Coordinate[]>([])

  // Map
  const [map, setMap] = React.useState<google.maps.Map | null>(null)
  const [initialZoom, setInitialZoom] = useState(0)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [secondMap, setSecondMap] = useState<google.maps.Map | null>(null)
  const [amountOfSensors, setAmountOfSensors] = useState<number>(0)
  const [areBoundsFitted, setAreBoundsFitted] = useState(false)
  const mapRef = useRef(null)
  const [mapInitialized, setMapInitialized] = useState(false)

  // User location tracking (using custom hook)
  const {
    isLocationEnabled,
    locationError,
    centerOnUserLocation,
  } = useUserLocation(map)

  // Chart overlays (using custom hook)
  const {
    setMoistChartDataContainer,
    setInvalidMoistChartDataContainer,
    setMoistOverlays,
    moistOverlaysRef,
    setTempChartDataContainer,
    setInvalidTempChartDataContainer,
    setTempOverlays,
    setValveChartDataContainer,
    setInvalidValveChartDataContainer,
    setValveOverlays,
    setWxetDataContainer,
    setInvalidWxetDataContainer,
    setFuelOverlays,
    setExtlDataContainer,
    moistChartsAmount,
    tempChartsAmount,
    valveChartsAmount,
    wxetChartsAmount,
    extlChartsAmount,
  } = useChartOverlays({
    isGoogleApiLoaded: props.isGoogleApiLoaded,
    map,
    setChartData: props.setChartData,
    setPage: props.setPage,
    setSiteId: props.setSiteId,
    setSiteName: props.setSiteName,
    setAdditionalChartData: props.setAdditionalChartData,
    setChartPageType: props.setChartPageType,
    siteList: props.siteList,
    userId: props.userId,
    present,
    setActiveOverlays,
  })

  // LayerList state
  const [checkedLayers, setCheckedLayers] = useState<{ [key: string]: boolean }>({})

  // QR Scanner state

  const history = useHistory()

  // Handle browser/device back button for Map page views
  // Push history state when entering overlays view, handle popstate to go back
  const isMarkerClickedRef = useRef(isMarkerClicked)
  isMarkerClickedRef.current = isMarkerClicked

  // Push browser history entries for Map page view transitions
  useEffect(() => {
    if (props.page === 1 && !isMarkerClicked) {
      // Entering sites view — push state so back goes to menu
      window.history.pushState({ mapView: 'sites' }, '')
    }
  }, [props.page])

  useEffect(() => {
    if (isMarkerClicked && props.page === 1) {
      // Entering overlays view — push state so back goes to sites view
      window.history.pushState({ mapView: 'overlays' }, '')
    }
  }, [isMarkerClicked, props.page])

  // Listen for browser/device back button on the Map page
  useEffect(() => {
    if (props.page !== 1) return

    const handlePopState = () => {
      // Check if another handler already processed this event
      if ((window as any).__popstateHandledByModal) {
        (window as any).__popstateHandledByModal = false
        return
      }
      // Only handle if we're on the map page
      if (props.page !== 1) return

      if (isMarkerClickedRef.current) {
        // Currently in overlays view → go back to sites view
        setIsMarkerClicked(false)
        ;(window as any).__popstateHandledByModal = true
      } else {
        // Currently in sites view → go back to menu
        props.setPage(0)
        window.history.replaceState(null, '', '/AgriNET/menu')
        ;(window as any).__popstateHandledByModal = true
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [props.page, props.setPage])

  // Cleanup effect: Clear all overlays and sensor data when going back from sensors view (using custom hook)
  useMarkerClickCleanup({
    isMarkerClicked,
    activeOverlays,
    allOverlays,
    markers,
    moistOverlaysRef,
    setMoistOverlays,
    setTempOverlays,
    setValveOverlays,
    setFuelOverlays,
    setActiveOverlays,
    setAllOverlays,
    setMoistChartDataContainer,
    setInvalidMoistChartDataContainer,
    setTempChartDataContainer,
    setInvalidTempChartDataContainer,
    setValveChartDataContainer,
    setInvalidValveChartDataContainer,
    setWxetDataContainer,
    setInvalidWxetDataContainer,
    setExtlDataContainer,
    setCoordinatesForFitting,
    setAllCoordinatesOfMarkers,
    setAmountOfSensors,
    setAreBoundsFitted,
    setMarkers,
    setInitialZoom,
  })

  // Reset map state when userId changes (e.g., after logout/login with different user)
  useEffect(() => {
    // Clear existing markers from the map
    if (markers.length > 0) {
      markers.forEach((marker: any) => {
        if (marker.setMap) {
          marker.setMap(null);
          if (marker.infoWindow) {
            marker.infoWindow.close();
          }
        }
      });
    }

    // Reset all map-related state
    setMapInitialized(false);
    setMap(null);
    setSecondMap(null);
    setInitialZoom(0);
    setMarkers([]);
    setAllCoordinatesOfMarkers([]);
    setActiveOverlays([]);
    setAllOverlays([]);
    setCoordinatesForFitting([]);
    setAmountOfSensors(0);
    setAreBoundsFitted(false);
    setMoistOverlays([]);
    setTempOverlays([]);
    setValveOverlays([]);
    setFuelOverlays([]);
  }, [props.userId]);

  useEffect(() => {
    const initializeMap = async () => {
      if (props.page === 1 && activeTab === "map" && !mapInitialized) {
        // Use existing siteList from context (fetched on Menu page) or fetch as fallback
        let sitesData = props.siteList;

        // Only fetch if siteList is empty (fallback)
        if (!sitesData || sitesData.length === 0) {
          const sites = await getSiteList(props.userId);

          // Check if API call failed
          if ("success" in sites && sites.success === false) {
            console.error("Failed to load sites:", sites.error);
            present[0]({
              message: sites.error,
              duration: 5000,
              color: "danger",
              position: "top",
              buttons: ["Dismiss"],
            });
            // Set empty array to prevent crashes
            props.setSiteList([]);
            return; // Exit early
          }

          // API call successful
          props.setSiteList(sites.data);
          sitesData = sites.data;
        }

        if (mapRef.current) {
          createMap(map, setMap, mapRef)
          setMapInitialized(true)

          if (map && sitesData && sitesData.length > 0) {
            const sitesAsSensorsGroupData = sitesData.map((site: SiteWithLayers) => ({
              lat: site.lat,
              lng: site.lng,
              name: site.name,
              layers: site.layers || [],
            })) as unknown as Site[]
            setTimeout(() => {
              createSites({
                page: props.page,
                map,
                siteList: sitesAsSensorsGroupData,
                markers: markers,
                setMarkers: setMarkers,
                userId: props.userId,
                allCoordinatesOfMarkers,
                setCoordinatesForFitting,
                setAllCoordinatesOfMarkers,
                setSecondMap,
                moistChartsAmount: moistChartsAmount as any,
                setInvalidMoistChartDataContainer,
                setMoistChartDataContainer,
                wxetChartsAmount: wxetChartsAmount as any,
                setInvalidWxetDataContainer,
                setWxetDataContainer,
                tempChartsAmount: tempChartsAmount as any,
                setInvalidTempChartDataContainer,
                setTempChartDataContainer,
                valveChartsAmount: valveChartsAmount as any,
                setInvalidValveChartDataContainer,
                setValveChartDataContainer,
                amountOfSensors,
                setAmountOfSensors,
                setIsMarkerClicked,
                setInitialZoom,
                extlChartsAmount: extlChartsAmount as any,
                setExtlDataContainer,
                mapRefFunc
              })
            }, 2000)
          }
        }
      }
    }
    initializeMap()
  }, [props.page, activeTab, mapInitialized])
  useEffect(() => {
    if (activeOverlays.length !== 0) {
      CollisionResolver.resolve(activeOverlays)
    }
    // Only create site markers if:
    // 1. Map exists and site list is loaded
    // 2. Markers array is empty
    // Note: Create markers even when restoring, as they're needed for overlay recreation
    if (map && props.siteList.length > 0 && markers.length === 0) {
      // Map Site[] to SensorsGroupData[]
      const sitesAsSensorsGroupData = props.siteList.map((site: SiteWithLayers) => ({
        lat: site.lat,
        lng: site.lng,
        name: site.name,
        layers: site.layers || [], // Use layers from API data
      })) as unknown as Site[]
      createSites({
        page: props.page,
        map,
        siteList: sitesAsSensorsGroupData,
        markers: markers,
        setMarkers: setMarkers,
        userId: props.userId,
        allCoordinatesOfMarkers,
        setCoordinatesForFitting,
        setAllCoordinatesOfMarkers,
        setSecondMap,
        moistChartsAmount: moistChartsAmount as any,
        setInvalidMoistChartDataContainer,
        setMoistChartDataContainer,
        wxetChartsAmount: wxetChartsAmount as any,
        setInvalidWxetDataContainer,
        setWxetDataContainer,
        tempChartsAmount: tempChartsAmount as any,
        setInvalidTempChartDataContainer,
        setTempChartDataContainer,
        valveChartsAmount: valveChartsAmount as any,
        setInvalidValveChartDataContainer,
        setValveChartDataContainer,
        amountOfSensors,
        setAmountOfSensors,
        setIsMarkerClicked,
        setInitialZoom,
        initialZoom,
        extlChartsAmount: extlChartsAmount as any,
        setExtlDataContainer,
        history,
        setChartData: props.setChartData,
        setPage: props.setPage,
        setSiteId: props.setSiteId,
        setSiteName: props.setSiteName,
        setChartPageType: props.setChartPageType,
        setAdditionalChartData: props.setAdditionalChartData,
        mapRefFunc
      })
    }
  }, [map, props.siteList, markers, mapRefFunc])

  // Fix map display after returning from overlay
  useEffect(() => {
    // Only reset when switching TO map from another tab within the SAME page
    // Don't reset when coming back from a different page (like chart page)
    const previousTab = previousTabRef.current
    const previousPage = previousPageRef.current
    const isReturningToMap = activeTab === "map" && previousTab !== "map"
    const isComingBackFromAnotherPage = props.page === 1 && previousPage !== 1
    const isComingBackFromChartPage = props.page === 1 && previousPage === 2

    // Call Collision Resolver when returning from Chart page
    if (isComingBackFromChartPage && activeOverlays.length > 0) {
      CollisionResolver.resolve(activeOverlays)
    }

    if (isReturningToMap && !isComingBackFromAnotherPage && map && mapRef.current) {
      // Clear all markers (both site and sensor markers)
      markers.forEach((marker: any) => {
        if (marker.setMap) {
          marker.setMap(null)
          if (marker.infoWindow) {
            marker.infoWindow.close()
          }
        }
      })

      // Force Google Maps to resize and redraw FIRST
      // Use multiple animation frames to ensure the map div is fully visible
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (map && mapRef.current) {
            // Trigger resize multiple times to force tile loading
            google.maps.event.trigger(map, "resize")

            setTimeout(() => {
              google.maps.event.trigger(map, "resize")

              // Now reset markers to trigger re-creation AFTER resize is done
              setMarkers([])
              setIsMarkerClicked(false)
            }, 200)
          }
        })
      })
    }

    // Update previous tab and page references
    previousTabRef.current = activeTab
    previousPageRef.current = props.page
  }, [activeTab, map, props.page, activeOverlays])

  // GPS Location functions are now handled by useUserLocation hook
  // Wrapper for MapTab component that doesn't pass map parameter
  const centerMapOnUserLocation = useCallback(() => {
    if (map) {
      centerOnUserLocation(map)
    }
  }, [map, centerOnUserLocation])

  // Chart overlay creation is now handled by useChartOverlays hook

  useEffect(() => {
    if (!map) return
    if (activeOverlays.length !== 0 && activeOverlays.length === amountOfSensors && !areBoundsFitted) {
      CollisionResolver.resolve(activeOverlays)
      setAllOverlays(activeOverlays)
      const bounds = new google.maps.LatLngBounds()
      coordinatesForFitting.forEach((coordinate: Coordinate) => {
        bounds.extend({ lat: coordinate.lat, lng: coordinate.lng })
      })
      const calculateZoomLevel = (bounds: google.maps.LatLngBounds, mapDim: { height: number; width: number }) => {
        const WORLD_DIM = { height: 256, width: 256 }
        const ZOOM_MAX = 21

        function latRad(lat: number) {
          const sin = Math.sin((lat * Math.PI) / 180)
          const radX2 = Math.log((1 + sin) / (1 - sin)) / 2
          return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2
        }

        function zoom(mapPx: number, worldPx: number, fraction: number) {
          return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2)
        }

        const ne = bounds.getNorthEast()
        const sw = bounds.getSouthWest()

        const latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI

        const lngDiff = ne.lng() - sw.lng()
        const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360

        const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction)
        const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction)

        return Math.min(latZoom, lngZoom, ZOOM_MAX)
      }
      const mapDiv = map.getDiv()
      const mapDim = {
        height: mapDiv.offsetHeight - 100,
        width: mapDiv.offsetWidth - 100,
      }
      const calculatedZoom = calculateZoomLevel(bounds, mapDim)
      map.setZoom(calculatedZoom)

      requestAnimationFrame(() => {
        setTimeout(() => {
          if (!map) return
          google.maps.event.trigger(map, "resize")
          map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 })

          setAreBoundsFitted(true)
        }, 100)
      })
    }
    return undefined
  }, [activeOverlays])

  // Collision resolution is now handled by useCollisionResolution hook
  useCollisionResolution({
    map,
    activeOverlays,
    areBoundsFitted,
  })

  // Map visibility is now handled by useMapVisibility hook
  useMapVisibility({
    map,
    mapRef,
    activeTab,
    coordinatesForFitting,
  })

  // LayerList useEffect - initialize checked layers based on current site
  // Load saved preferences from localStorage or default to all checked
  useEffect(() => {
    console.log('[Map] Initializing layers, isMarkerClicked:', isMarkerClicked, 'userId:', props.userId);
    const initialCheckedState: { [key: string]: boolean } = {}

    // Get site name from isMarkerClicked (it's set to the site name string when a site is clicked)
    const siteName = typeof isMarkerClicked === "string" ? isMarkerClicked : ""

    if (props.siteList && Array.isArray(props.siteList) && siteName) {
      console.log('[Map] Site name for layer preferences:', siteName);

      // Try to load saved preferences
      const savedPreferences = loadLayerPreferences(props.userId, siteName)
      console.log('[Map] Loaded saved preferences:', savedPreferences);

      props.siteList.forEach((site: SiteWithLayers) => {
        if (site && site.name === siteName && site.layers && Array.isArray(site.layers)) {
          site.layers.forEach((layer: LayerListLayer) => {
            if (layer && layer.name) {
              // Use saved preference if available, otherwise default to true (checked)
              const layerChecked = savedPreferences?.[layer.name] ?? true
              initialCheckedState[layer.name] = layerChecked
              console.log('[Map] Layer', layer.name, 'checked:', layerChecked, '(saved:', savedPreferences?.[layer.name], ')');
            }
          })
        }
      })
    }
    console.log('[Map] Final initial checked state:', initialCheckedState);
    setCheckedLayers(initialCheckedState)
  }, [isMarkerClicked, props.siteList, props.userId])

  // Apply saved layer preferences to overlays - hide unchecked layers
  // This runs AFTER all overlays are created and shown
  useEffect(() => {
    if (allOverlays && allOverlays.length > 0 && Object.keys(checkedLayers).length > 0) {
      console.log('[Map] Applying layer preferences to overlays:', checkedLayers);

      // Wait a bit to ensure all overlays are fully rendered
      const timeoutId = setTimeout(() => {
        allOverlays.forEach((overlay: OverlayItem) => {
          const layerName = overlay?.chartData?.layerName
          if (layerName && typeof checkedLayers[layerName] !== 'undefined') {
            const shouldShow = checkedLayers[layerName]
            console.log('[Map] Overlay', layerName, 'should show:', shouldShow);

            if (!shouldShow) {
              // Hide the overlay using hide() only - keep it on the map
              console.log('[Map] Hiding overlay:', layerName, overlay?.chartData?.sensorId);
              if (overlay.hide && typeof overlay.hide === 'function') {
                overlay.hide()
              }
              // Remove from activeOverlays if it's there
              setActiveOverlays((prev: OverlayItem[]) =>
                prev.filter((active: OverlayItem) =>
                  active?.chartData?.sensorId !== overlay?.chartData?.sensorId
                )
              )
            }
          }
        })
      }, 100) // Small delay to let overlays render

      return () => clearTimeout(timeoutId)
    }
  }, [allOverlays, checkedLayers])

  const renderContent = () => {
    switch (activeTab) {
      case "map":
        return (
          <MapTab
            mapRef={mapRef}
            centerMapOnUserLocation={centerMapOnUserLocation}
            isLocationEnabled={isLocationEnabled}
            locationError={locationError}
            siteList={props.siteList}
            activeOverlays={activeOverlays}
            allOverlays={allOverlays}
            secondMap={secondMap}
            isMarkerClicked={isMarkerClicked}
            checkedLayers={checkedLayers}
            setCheckedLayers={setCheckedLayers}
            setActiveOverlays={setActiveOverlays}
            amountOfSensors={amountOfSensors}
            userId={props.userId}
            map={map}
          />
        )
      case "info":
        return <InfoTab />
      default:
        return null
    }
  }

  return (
    <IonPage>
      <Header
        setPage={props.setPage}
        setIsMarkerClicked={setIsMarkerClicked}
        isMarkerClicked={isMarkerClicked}
        reloadMapPage={props.reloadMapPage}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navigationHistory={navigationHistory}
        setNavigationHistory={setNavigationHistory}
        isMobileScreen={layerListState.isMobileScreen}
        isLayerListVisible={layerListState.isLayerListVisible}
        hasLayersToShow={layerListState.hasLayersToShow}
        toggleLayerList={layerListState.toggleLayerList}
      />
      <IonContent className={s.ionContent} style={{ "--background": "white" }}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div
            className={activeTab === "map" ? undefined : s.contentWrapper}
            style={{ flex: 1, position: "relative" }}
          >
            {/* Keep map always mounted, just hide it */}
            <div style={{ display: activeTab === "map" ? "block" : "none", height: "100%", width: "100%" }}>
              <MapTab
                mapRef={mapRef}
                centerMapOnUserLocation={centerMapOnUserLocation}
                isLocationEnabled={isLocationEnabled}
                locationError={locationError}
                siteList={props.siteList}
                activeOverlays={activeOverlays}
                allOverlays={allOverlays}
                secondMap={secondMap}
                isMarkerClicked={isMarkerClicked}
                checkedLayers={checkedLayers}
                setCheckedLayers={setCheckedLayers}
                setActiveOverlays={setActiveOverlays}
                amountOfSensors={amountOfSensors}
                userId={props.userId}
                map={map}
                onLayerStateChange={setLayerListState}
              />
            </div>
            {/* Render other tabs */}
            {activeTab !== "map" && renderContent()}
          </div>
        </div>

        <SensorModal
          isOpen={isSensorModalOpen}
          onClose={handleCloseSensorModal}
          onConfirm={handleSensorSelect}
          selectedSensor={selectedSensor}
          sensors={availableSensors}
        />

        <NewLayerModal
          isOpen={isNewLayerModalOpen}
          onClose={() => setIsNewLayerModalOpen(false)}
          onFinish={handleFinishNewLayer}
          newLayerName={newLayerName}
          setNewLayerName={setNewLayerName}
          newLayerMarkerType={newLayerMarkerType}
          setNewLayerMarkerType={setNewLayerMarkerType}
          newLayerTable={newLayerTable}
          setNewLayerTable={setNewLayerTable}
          newLayerColumn={newLayerColumn}
          setNewLayerColumn={setNewLayerColumn}
        />
      </IonContent>
    </IonPage>
  )
}

export default MapPage