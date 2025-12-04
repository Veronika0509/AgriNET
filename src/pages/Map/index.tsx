"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import {
  IonPage,
  IonContent,
  useIonToast,
  useIonAlert,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonCheckbox,
  IonModal,
  IonHeader,
} from "@ionic/react"
import SensorModal from "./components/modals/SensorModal"
import { NewLayerModal } from "./components/modals/NewLayerModal"
import { useHistory } from "react-router-dom"
import { documentText, home, informationCircle, add, settings, cameraOutline } from "ionicons/icons"
import type { Site, SensorData, ChartPageType, UserId, SiteId } from "../../types"
import { AddUnitContainer } from "../../features/AddUnit"
import type { LayerListLayer, SiteWithLayers, Coordinate } from "./types"
import type { OverlayItem } from "./types/OverlayItem"
import Header from "./components/Header"
import { getSiteList } from "./data/getSiteList"
import { getLayers } from "./data/getLayers"
import { createMap } from "./functions/createMap"
import { createSites } from "./functions/createSites"
import { CollisionResolver } from "./components/CollisionResolver"
import s from "./style.module.css"
// Tab components
import { MapTab } from "./components/tabs/MapTab"
import { InfoTab } from "./components/tabs/InfoTab"
import { CommentsTab } from "./components/tabs/CommentsTab"
import { BudgetEditorTab } from "./components/tabs/BudgetEditorTab"
// Custom hooks
import { useUserLocation } from "./hooks/useUserLocation"
import { useMarkerClickCleanup } from "./hooks/useMarkerClickCleanup"
import { useLayers } from "./hooks/useLayers"
import { useChartOverlays } from "./hooks/useChartOverlays"
import { useSiteManagement } from "./hooks/useSiteManagement"
import { useLayerCreation } from "./hooks/useLayerCreation"
import { useMapBounds } from "./hooks/useMapBounds"
import { useCollisionResolution } from "./hooks/useCollisionResolution"
import { useMapVisibility } from "./hooks/useMapVisibility"
import { useAppContext } from "../../context/AppContext"

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
  const { openBudgetEditor, setOpenBudgetEditor, budgetEditorReturnPage, setBudgetEditorReturnPage, setReturnToMapTab, returnToMapTab, originalMapTab, setOriginalMapTab, preservedIsMarkerClicked, setPreservedIsMarkerClicked, preservedSecondMap, setPreservedSecondMap, forceMapTab, setForceMapTab } = useAppContext()
  const location = useHistory().location
  const present = useIonToast()
  const [presentAlert] = useIonAlert()
  const userRole = localStorage.getItem("userRole")
  const [presentEmptyNameAlert] = useIonAlert()
  const [activeTab, setActiveTab] = useState("map")
  const [navigationHistory, setNavigationHistory] = useState<string[]>(["map"])
  const [hasOpenedBudgetEditor, setHasOpenedBudgetEditor] = useState(false)
  const [centerMarker, setCenterMarker] = useState<google.maps.Marker | null>(null)
  const [isMarkerClicked, setIsMarkerClicked] = useState(false)
  const [, setAreArraysUpdated] = useState(false)
  const mapRefFunc = useRef(null);
  const previousTabRef = useRef("map")
  const previousPageRef = useRef(props.page)
  const isHandlingBackNavRef = useRef(false)

  // Layer list state for mobile menu icon
  const [layerListState, setLayerListState] = useState({
    isMobileScreen: false,
    isLayerListVisible: true,
    hasLayersToShow: false,
    toggleLayerList: () => {},
  })

  // Keep layers state - it's shared with Map tab (using custom hook)
  const { layers, setLayers, layerMapping, setLayerMapping, isLoadingLayers } = useLayers()

  // Site management (using custom hook)
  const { isSiteNameValid, handleCreateNewSite, showCreateNewSiteAlert } = useSiteManagement({
    siteList: props.siteList,
    setSiteList: props.setSiteList,
    setSelectedSiteForAddUnit: props.setSelectedSiteForAddUnit,
  })

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
    isLayerNameValid,
    handleCreateNewLayer,
    showCreateNewLayerAlert,
    handleFinishNewLayer,
  } = useLayerCreation({
    layers,
    setLayers,
    setLayerMapping,
  })

  // Sensor modal state (shared)
  const [isSensorModalOpen, setIsSensorModalOpen] = useState(false)
  const [selectedSensor, setSelectedSensor] = useState<any>(null)
  const [availableSensors, setAvailableSensors] = useState<any[]>([])

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
    userLocation,
    userLocationMarker,
    isLocationEnabled,
    locationError,
    getCurrentLocation: getUserLocation,
    centerOnUserLocation,
  } = useUserLocation(map)

  // Chart overlays (using custom hook)
  const {
    moistChartDataContainer,
    setMoistChartDataContainer,
    invalidMoistChartDataContainer,
    setInvalidMoistChartDataContainer,
    moistOverlays,
    setMoistOverlays,
    moistOverlaysRef,
    tempChartDataContainer,
    setTempChartDataContainer,
    invalidTempChartDataContainer,
    setInvalidTempChartDataContainer,
    tempOverlays,
    setTempOverlays,
    valveChartDataContainer,
    setValveChartDataContainer,
    invalidValveChartDataContainer,
    setInvalidValveChartDataContainer,
    valveOverlays,
    setValveOverlays,
    wxetDataContainer,
    setWxetDataContainer,
    invalidWxetDataContainer,
    setInvalidWxetDataContainer,
    fuelOverlays,
    setFuelOverlays,
    extlDataContainer,
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

  // Cleanup effect: Clear all overlays and sensor data when going back from sensors view (using custom hook)
  useMarkerClickCleanup({
    isMarkerClicked,
    activeOverlays,
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

  useEffect(() => {
    const initializeMap = async () => {
      if (props.page === 1 && activeTab === "map" && !mapInitialized) {
        const sites = await getSiteList(props.userId)

        // Check if API call failed
        if ("success" in sites && sites.success === false) {
          console.error("Failed to load sites:", sites.error)
          present[0]({
            message: sites.error,
            duration: 5000,
            color: "danger",
            position: "top",
            buttons: ["Dismiss"],
          })
          // Set empty array to prevent crashes
          props.setSiteList([])
          return // Exit early
        }

        // API call successful
        props.setSiteList(sites.data)

        if (mapRef.current) {
          createMap(map, setMap, mapRef, mapRefFunc)
          setMapInitialized(true)

          if (map && sites.data && sites.data.length > 0) {
            const sitesAsSensorsGroupData = sites.data.map((site: SiteWithLayers) => ({
              lat: site.lat,
              lng: site.lng,
              name: site.name,
              layers: site.layers || [],
            }))
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
              moistChartsAmount,
              setInvalidMoistChartDataContainer,
              setMoistChartDataContainer,
              wxetChartsAmount,
              setInvalidWxetDataContainer,
              setWxetDataContainer,
              tempChartsAmount,
              setInvalidTempChartDataContainer,
              setTempChartDataContainer,
              valveChartsAmount,
              setInvalidValveChartDataContainer,
              setValveChartDataContainer,
              amountOfSensors,
              setAmountOfSensors,
              setIsMarkerClicked,
              setInitialZoom,
              extlChartsAmount,
              setExtlDataContainer,
              mapRefFunc
            })
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
      }))
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
        moistChartsAmount,
        setInvalidMoistChartDataContainer,
        setMoistChartDataContainer,
        wxetChartsAmount,
        setInvalidWxetDataContainer,
        setWxetDataContainer,
        tempChartsAmount,
        setInvalidTempChartDataContainer,
        setTempChartDataContainer,
        valveChartsAmount,
        setInvalidValveChartDataContainer,
        setValveChartDataContainer,
        amountOfSensors,
        setAmountOfSensors,
        setIsMarkerClicked,
        setInitialZoom,
        initialZoom,
        extlChartsAmount,
        setExtlDataContainer,
        setAreArraysUpdated,
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

    // Don't reset if we have preserved state waiting to be restored
    const hasPreservedState = preservedIsMarkerClicked && preservedSecondMap

    // Don't reset if we're handling back navigation (forceMapTab just ran)
    if (isReturningToMap && !isComingBackFromAnotherPage && !hasPreservedState && !isHandlingBackNavRef.current && map && mapRef.current) {
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
  }, [activeTab, map, props.page, preservedIsMarkerClicked, preservedSecondMap])

  // GPS Location functions are now handled by useUserLocation hook
  // Wrapper for MapTab component that doesn't pass map parameter
  const centerMapOnUserLocation = useCallback(() => {
    if (map) {
      centerOnUserLocation(map)
    }
  }, [map, centerOnUserLocation])

  // Chart overlay creation is now handled by useChartOverlays hook

  useEffect(() => {
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
  useEffect(() => {
    const initialCheckedState: { [key: string]: boolean } = {}
    if (props.siteList && Array.isArray(props.siteList) && secondMap) {
      const secondMapName = typeof secondMap === "string" ? secondMap : secondMap?.getDiv()?.id || ""
      props.siteList.forEach((site: SiteWithLayers) => {
        if (site && site.name === secondMapName && site.layers && Array.isArray(site.layers)) {
          site.layers.forEach((layer: LayerListLayer) => {
            if (layer && layer.name) {
              initialCheckedState[layer.name] = true
            }
          })
        }
      })
    }
    setCheckedLayers(initialCheckedState)
  }, [secondMap, props.siteList])

  // Initialize Add Unit map when Google API is loaded and activeTab is 'add'

  // Force map tab when coming back from Chart page
  useEffect(() => {
    if (forceMapTab) {
      // Force the active tab to 'map'
      setActiveTab('map')
      setNavigationHistory(['map'])
      // Clear the flag
      setForceMapTab(false)
      // Prevent budget tab from opening
      isHandlingBackNavRef.current = true
      setTimeout(() => {
        isHandlingBackNavRef.current = false
      }, 300)
    }
  }, [forceMapTab, setForceMapTab])

  // Navigate to budget editor when flag is set from Chart page
  useEffect(() => {
    // Only open budget editor if the flag is explicitly set AND we're not forcing map tab
    if (openBudgetEditor && !isHandlingBackNavRef.current) {
      setActiveTab("budget")
      setNavigationHistory((prev) => [...prev, "budget"])
      setHasOpenedBudgetEditor(true)
      // Reset the flag after navigation
      setOpenBudgetEditor(false)
      // Only clear preserved state if we're opening budget editor directly from Map page
      // If budgetEditorReturnPage is 'chart', we're coming from Chart page and need to keep preserved state
      if (budgetEditorReturnPage !== 'chart' && (preservedIsMarkerClicked || preservedSecondMap)) {
        setPreservedIsMarkerClicked(false)
        setPreservedSecondMap(null)
      }
    }
  }, [openBudgetEditor, setOpenBudgetEditor, preservedIsMarkerClicked, preservedSecondMap, setPreservedIsMarkerClicked, setPreservedSecondMap, hasOpenedBudgetEditor, budgetEditorReturnPage])

  // Reset budgetEditorReturnPage when leaving budget editor tab
  // Only reset if we've actually opened the budget editor (to avoid resetting on initial mount)
  useEffect(() => {
    // Reset when:
    // 1. Switching away from budget tab to another tab within map page (but NOT to another page)
    const isLeavingBudgetTabWithinMapPage = activeTab !== "budget" && props.page === 1

    if (isLeavingBudgetTabWithinMapPage && budgetEditorReturnPage && hasOpenedBudgetEditor) {
      setBudgetEditorReturnPage(null)
      setHasOpenedBudgetEditor(false)
      // Only clear returnToMapTab when staying on map page, not when going to chart
      if (returnToMapTab === 'budget') {
        setReturnToMapTab(null)
      }
    }
  }, [activeTab, props.page, budgetEditorReturnPage, hasOpenedBudgetEditor, returnToMapTab, setBudgetEditorReturnPage, setReturnToMapTab])

  // Clear openBudgetEditor flag FIRST when returning from chart page
  // This must run before other useEffects to prevent budget tab from opening
  useEffect(() => {
    const previousPage = previousPageRef.current
    const isComingBackFromAnotherPage = props.page === 1 && previousPage !== 1

    // Immediately clear the flag when returning via back button
    if (isComingBackFromAnotherPage && openBudgetEditor) {
      setOpenBudgetEditor(false)
    }
  }, [props.page, openBudgetEditor, setOpenBudgetEditor])

  // Reset to original tab when returning from chart page (unless opening budget editor)
  useEffect(() => {
    // Skip this useEffect if we're currently handling back navigation
    // The fromBack useEffect will handle tab setting
    if (isHandlingBackNavRef.current) {
      return
    }

    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    const fromBack = params.get('fromBack')
    const previousPage = previousPageRef.current
    const isComingBackFromAnotherPage = props.page === 1 && previousPage !== 1

    // Skip if fromBack parameter is present - let the other useEffect handle it
    if (fromBack) {
      return
    }

    // If there's a tab parameter in the URL, use it
    if (tab && tab !== activeTab) {
      setActiveTab(tab)
      setNavigationHistory((prev) => [...prev, tab])
      // Clear the query parameter from URL after reading
      setReturnToMapTab(null)
      // Remove the query parameter from the URL
      history.replace('/map')
    }
    // When returning from chart page, always restore to the map tab
    else if (isComingBackFromAnotherPage) {
      // Always restore to 'map' tab when clicking back from chart
      if (activeTab !== 'map') {
        setActiveTab('map')
        setNavigationHistory(['map'])
      }

      // Clear all restoration flags after restoring
      if (originalMapTab) {
        setOriginalMapTab(null)
      }
      if (returnToMapTab) {
        setReturnToMapTab(null)
      }
      if (budgetEditorReturnPage) {
        setBudgetEditorReturnPage(null)
      }
    }
  }, [location.search, activeTab, history, returnToMapTab, props.page, hasOpenedBudgetEditor, preservedIsMarkerClicked, preservedSecondMap, originalMapTab, setOriginalMapTab, budgetEditorReturnPage, setBudgetEditorReturnPage, setReturnToMapTab])

  // Save isMarkerClicked, secondMap, and activeTab when navigating away from map page
  useEffect(() => {
    const isLeavingMapPage = props.page !== 1
    const previousPage = previousPageRef.current

    if (isLeavingMapPage && previousPage === 1) {
      // Save the current active tab when first leaving map page to chart
      setOriginalMapTab(activeTab)

      if (isMarkerClicked) {
        setPreservedIsMarkerClicked(true)
        setPreservedSecondMap(secondMap)
      }
    }
  }, [props.page, isMarkerClicked, secondMap, activeTab, setPreservedIsMarkerClicked, setPreservedSecondMap, setOriginalMapTab])

  // Restore isMarkerClicked and secondMap state when returning from chart page
  useEffect(() => {
    const previousPage = previousPageRef.current
    const isComingBackFromAnotherPage = props.page === 1 && previousPage !== 1

    // Only restore when coming back to map page and not actively opening budget editor
    const isNavigatingToBudgetTab = openBudgetEditor

    if (isComingBackFromAnotherPage && preservedIsMarkerClicked && preservedSecondMap && !isNavigatingToBudgetTab) {
      // Extract the site name from preservedSecondMap
      const siteName = typeof preservedSecondMap === 'string' ? preservedSecondMap : preservedSecondMap?.getDiv?.()?.id || ''

      // Just restore the state without recreating overlays
      // The overlays should still be in memory if the map stayed mounted
      setIsMarkerClicked(siteName)
      setSecondMap(preservedSecondMap)

      // Clear preserved state immediately after restoring
      setPreservedIsMarkerClicked(false)
      setPreservedSecondMap(null)
    }
  }, [props.page, preservedIsMarkerClicked, preservedSecondMap, openBudgetEditor, setPreservedIsMarkerClicked, setPreservedSecondMap])

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
            checkedLayers={checkedLayers}
            setCheckedLayers={setCheckedLayers}
            setActiveOverlays={setActiveOverlays}
          />
        )
      case "budget":
        return <BudgetEditorTab siteList={props.siteList} userId={props.userId} isGoogleApiLoaded={props.isGoogleApiLoaded} />
      case "info":
        return <InfoTab />
      case "comments":
        return <CommentsTab userId={props.userId} />
      case "add":
        return (
          <AddUnitContainer
            userId={props.userId}
            siteList={props.siteList}
            setSiteList={props.setSiteList}
            selectedSiteForAddUnit={props.selectedSiteForAddUnit}
            setSelectedSiteForAddUnit={props.setSelectedSiteForAddUnit}
            setSelectedMoistureSensor={props.setSelectedMoistureSensor}
            setPage={props.setPage}
            isGoogleApiLoaded={props.isGoogleApiLoaded}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setNavigationHistory={setNavigationHistory}
            markers={markers}
            setMarkers={setMarkers}
            layers={layers}
            setLayers={setLayers}
            layerMapping={layerMapping}
            setLayerMapping={setLayerMapping}
            isLoadingLayers={isLoadingLayers}
            showCreateNewSiteAlert={showCreateNewSiteAlert}
            showCreateNewLayerAlert={showCreateNewLayerAlert}
          />
        )
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
            className={activeTab === "map" ? undefined : activeTab === "add" ? undefined : s.contentWrapper}
            style={{ flex: 1, marginBottom: "48px", position: "relative" }}
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
                checkedLayers={checkedLayers}
                setCheckedLayers={setCheckedLayers}
                setActiveOverlays={setActiveOverlays}
                onLayerStateChange={setLayerListState}
              />
            </div>
            {/* Render other tabs */}
            {activeTab !== "map" && renderContent()}
          </div>
          <IonSegment value={activeTab} className={s.appMenu}>
            <IonSegmentButton
              className={s.appMenuButton}
              value="map"
              onClick={() => {
                setNavigationHistory((prev) => [...prev, "map"])
                // Reset marker clicked state when clicking map tab (same as back arrow behavior)
                // This ensures proper cleanup and return to site view
                if (isMarkerClicked) {
                  setIsMarkerClicked(false)
                }
                setActiveTab("map")
              }}
            >
              <IonIcon icon={home} />
            </IonSegmentButton>
            <IonSegmentButton
              className={s.appMenuButton}
              value="comments"
              onClick={() => {
                setNavigationHistory((prev) => [...prev, "comments"])
                // Reset marker clicked state when navigating to comments
                // This ensures site markers are properly restored when returning to map
                if (isMarkerClicked) {
                  setIsMarkerClicked(false)
                }
                setActiveTab("comments")
              }}
            >
              <IonIcon icon={documentText} />
            </IonSegmentButton>
            <IonSegmentButton
              className={s.appMenuButton}
              value="budget"
              onClick={() => {
                setNavigationHistory((prev) => [...prev, "budget"])
                setActiveTab("budget")
              }}
            >
              <IonIcon icon={settings} />
            </IonSegmentButton>
            <IonSegmentButton
              className={s.appMenuButton}
              value="add"
              onClick={() => {
                setNavigationHistory((prev) => [...prev, "add"])
                setActiveTab("add")
                // Reset marker clicked state when navigating to add unit
                // This ensures proper cleanup and zoom restoration when returning to map
                setIsMarkerClicked(false)
                // Also clear secondMap to avoid any lingering site-specific state
                setSecondMap(null)
              }}
            >
              <IonIcon icon={add} />
            </IonSegmentButton>
          </IonSegment>
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