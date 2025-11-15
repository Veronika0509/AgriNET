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
import SensorSelector from "../VirtualValve/components/TimezoneSelector"
import { useHistory } from "react-router-dom"
import { documentText, home, informationCircle, add, settings, cameraOutline } from "ionicons/icons"
import type { Site, SensorData, ChartPageType, UserId, SiteId } from "../../types"
import { AddUnitContainer } from "../../features/AddUnit"
// LayerList interfaces
interface LayerListLayer {
  name: string
  markers: LayerListMarker[]
  [key: string]: unknown
}

interface LayerListMarker {
  chartData: {
    sensorId: string | number
    [key: string]: unknown
  }
  [key: string]: unknown
}

// Extend Site interface to include layers
interface SiteWithLayers extends Site {
  layers?: LayerListLayer[]
}
import invalidChartDataImage from "../../assets/images/invalidChartData.png"

// Chart data types (using unknown for now to avoid compilation errors)
type MoistChartData = unknown
type FuelChartData = unknown
type TempChartData = unknown

// Extl data types
interface ExtlSensorData {
  sensorId: string | number
  name?: string
  lat: number
  lng: number
  graphic?: unknown
  width?: number
  height?: number
  [key: string]: unknown
}

interface ExtlBounds {
  lat: number
  lng: number
  [key: string]: unknown
}

type ExtlDataContainerItem = [ExtlSensorData, ExtlBounds]

// Custom overlay constructor type
type CustomOverlayConstructor = {
  new (...args: any[]): OverlayItem
}

// Chart data with bounds type
type ChartDataWithBounds<T> = [T, google.maps.LatLngBounds]

// Marker type
type Marker = {
  position: google.maps.LatLngLiteral
  id: string | number
  type: string
  [key: string]: unknown
}
import Header from "./components/Header"
import { initializeMoistCustomOverlay } from "./components/types/moist/MoistCustomOverlay"
import { getSiteList } from "./data/getSiteList"
import { getLayers } from "./data/getLayers"
import QRCodeScanner from "../../components/QRCodeScanner"
import { createMap } from "./functions/createMap"
import { createSites } from "./functions/createSites"
import { createMoistChartForOverlay } from "./functions/types/moist/createMoistChartForOverlay"
import { initializeWxetCustomOverlay } from "./components/types/wxet/WxetCustomOverlay"
import { initializeTempCustomOverlay } from "./components/types/temp/TempCustomOverlay"
import { createTempChartForOverlay } from "./functions/types/temp/createTempChartForOverlay"
import { CollisionResolver } from "./components/CollisionResolver"
import { initializeValveCustomOverlay } from "./components/types/valve/ValveCustomOverlay"
import { createValveChartForOverlay } from "./functions/types/valve/createValveChartForOverlay"
import s from "./style.module.css"
import { addOverlayToOverlaysArray } from "./functions/types/moist/addOverlayToOverlaysArray"
import { initializeExtlCustomOverlay } from "./components/types/extl/ExtlCustomOverlay"
import { initializeFuelCustomOverlay } from "./components/types/wxet/FuelCustomOverlay"
import { createFuelChartForOverlay } from "./functions/types/wxet/createFuelChartForOverlay"
import type { OverlayItem } from "./types/OverlayItem"
import { validateSensorId, getAllSensorIds, checkSensorIdExists } from "./functions/sensorValidation"
import { roundCoordinate, roundCoordinates, findClosestSite } from "./functions/coordinateUtils"
import Login from "@/pages/Login";
// Tab components
import { MapTab } from "./components/tabs/MapTab"
import { InfoTab } from "./components/tabs/InfoTab"
import { CommentsTab } from "./components/tabs/CommentsTab"
import { BudgetEditorTab } from "./components/tabs/BudgetEditorTab"

// Типы (already imported above)

// Интерфейсы для типизации Map компонента
interface ChartDataItem {
  sensorId: string | number
  markerType?: string
  [key: string]: unknown
}

// Base interface for custom overlays
interface BaseOverlay {
  show: () => void
  hide: () => void
  getBounds: () => {
    north: number
    south: number
    east: number
    west: number
  }
  getPosition: () => { lat: number; lng: number }
  setPosition: (lat: number, lng: number) => void
  getDiv: () => HTMLElement | null
  draw: () => void
  setMap: (map: google.maps.Map | null) => Promise<void>
  update?: () => void
  sensorId: string | number
  layerName: string
  [key: string]: unknown
}

// Type for custom overlay constructor functions (duplicate removed - using definition from line 47)

interface Coordinate {
  lat: number
  lng: number
}

// Interface for chart data bounds
interface ChartBounds {
  north: number
  south: number
  east: number
  west: number
}

// Type for chart data with bounds (duplicate removed - using definition from line 52)

// Interface for amCharts root elements
interface ChartRoot {
  dispose: () => void
  [key: string]: unknown
}

// Base interface for all overlay items (duplicate removed - using definition from line 36)

// Interface for API responses
interface ApiResponse<T> {
  data: T
}

// Type for marker data
// Marker interface (duplicate removed - using type definition from line 55)

// Type for sensor data point
interface DataPoint {
  date: Date | string | number
  value: number
  [key: string]: unknown
}

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

declare global {
  interface Window {
    google: typeof google
  }

  const google: {
    maps: {
      Map: any
      Marker: any
      LatLng: any
      LatLngBounds: any
      SymbolPath: any
      event: any
      MapTypeId: any
      [key: string]: any
    }
  }

  namespace JSX {
    interface IntrinsicElements {
      "ion-icon": any
      "ion-input": any
    }
  }
}

// HTMLIonIconElement and HTMLIonInputElement declarations
interface HTMLIonIconElement extends HTMLElement {
  icon?: string
  color?: string
}

interface HTMLIonInputElement extends HTMLElement {
  value?: string | number | null
}

const MapPage: React.FC<MapProps> = (props) => {
  if (!props.reloadMapPage) {
  }
  const present = useIonToast()
  const [presentAlert] = useIonAlert()
  const userRole = localStorage.getItem("userRole")
  const [presentEmptyNameAlert] = useIonAlert()
  const [activeTab, setActiveTab] = useState("map")
  const [navigationHistory, setNavigationHistory] = useState<string[]>(["map"])
  const [centerMarker, setCenterMarker] = useState<google.maps.Marker | null>(null)
  const [isMarkerClicked, setIsMarkerClicked] = useState(false)
  const [, setAreArraysUpdated] = useState(false)
  const mapRefFunc = useRef(null);

  // Keep layers state - it's shared with Map tab
  const [layers, setLayers] = useState<Array<{ id: string; name: string; value: string }>>([])
  const [layerMapping, setLayerMapping] = useState<{ [key: string]: string }>({})
  const [isLoadingLayers, setIsLoadingLayers] = useState<boolean>(false)

  // New layer creation state (shared across tabs)
  const [presentEmptyLayerNameAlert] = useIonAlert()
  const [isNewLayerModalOpen, setIsNewLayerModalOpen] = useState<boolean>(false)
  const [newLayerName, setNewLayerName] = useState<string>("")
  const [newLayerMarkerType, setNewLayerMarkerType] = useState<string>("fuel")
  const [newLayerTable, setNewLayerTable] = useState<string>("")
  const [newLayerColumn, setNewLayerColumn] = useState<string>("")

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

  // Responsive design state
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth < 768)

  // Timezone modal state
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState<boolean>(false)
  const [selectedTimezone, setSelectedTimezone] = useState<string>("America/Los_Angeles")
  // Timezone modal handlers
  const handleCloseTimezoneModal = () => {
    setIsTimezoneModalOpen(false)
  }

  const handleTimezoneSelect = (timezone: string) => {
    setSelectedTimezone(timezone)
    setIsTimezoneModalOpen(false)
    // После выбора часового пояса переходим на страницу 3
    props.setPage(3)
  }

  // Purchase Request Alert function

  // Function to check if site name is valid
  const isSiteNameValid = (siteName: string): { isValid: boolean; error?: string } => {
    if (!siteName || !siteName.trim()) {
      return { isValid: false, error: "Site name cannot be empty" }
    }

    const trimmedName = siteName.trim()
    const siteExists = props.siteList.some((site) => site.name.toLowerCase() === trimmedName.toLowerCase())

    if (siteExists) {
      return { isValid: false, error: "A site with this name already exists" }
    }

    return { isValid: true }
  }

  // Function to check if layer name is valid
  const isLayerNameValid = (layerName: string): { isValid: boolean; error?: string } => {
    if (!layerName || !layerName.trim()) {
      return { isValid: false, error: "Layer name cannot be empty" }
    }

    const trimmedName = layerName.trim()
    const layerExists = layers.some((layer) => layer.name.toLowerCase() === trimmedName.toLowerCase())

    if (layerExists) {
      return { isValid: false, error: "A layer with this name already exists" }
    }

    return { isValid: true }
  }

  // Function to create a new site
  const handleCreateNewSite = async (siteName: string): Promise<Site | null> => {
    if (!siteName || !siteName.trim()) {
      // This should never happen as we check this before calling handleCreateNewSite
      return null
    }

    const validation = isSiteNameValid(siteName)

    if (!validation.isValid) {
      // Show error for duplicate name using the main alert
      try {
        await presentAlert({
          header: "Error",
          message: validation.error || "Invalid site name",
          buttons: ["OK"],
        })
      } catch (error) {}
      return null
    }

    try {
      const trimmedName = siteName.trim()

      // Create new site object
      const newSite: Site = {
        id: trimmedName as SiteId,
        name: trimmedName,
        lat: 0,
        lng: 0,
      }

      // Update the site list
      props.setSiteList((prev) => {
        const newList = [...prev, newSite]
        return newList
      })

      // Select the new site (for Add Unit container if needed)
      props.setSelectedSiteForAddUnit(trimmedName)

      return newSite
    } catch (error) {
      throw error // Пробрасываем ошибку дальше
    }
  }

  // Function to create a new layer
  const handleCreateNewLayer = async (
    layerName: string,
    markerType?: string,
    table?: string,
    column?: string,
  ): Promise<{ id: string; name: string; value: string } | null> => {
    if (!layerName || !layerName.trim()) {
      // This should never happen as we check this before calling handleCreateNewLayer
      return null
    }

    const validation = isLayerNameValid(layerName)

    if (!validation.isValid) {
      // Show error for duplicate name using the main alert
      try {
        await presentAlert({
          header: "Error",
          message: validation.error || "Invalid layer name",
          buttons: ["OK"],
        })
      } catch (error) {}
      return null
    }

    try {
      const trimmedName = layerName.trim()

      // Create new layer object
      const newLayer = {
        id: trimmedName.toLowerCase(),
        name: trimmedName,
        value: trimmedName.toLowerCase(),
        markerType: markerType || "fuel",
        table: table || "",
        column: column || "",
      }

      // Save layer data to backend
      try {
        const response = await fetch("https://app.agrinet.us/api/map/layers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            markerType: markerType || "fuel",
            table: table || "",
            column: column || "",
          }),
        })

        if (!response.ok) {
          console.error("Failed to save layer to backend:", response.statusText)
          throw new Error("Failed to save layer to backend")
        }

        // Reload layers from backend to get the updated list
        const layersData = await getLayers()
        setLayers(layersData.layers)
        setLayerMapping(layersData.mapping)
      } catch (apiError) {
        console.error("Error saving layer to backend:", apiError)
        // If backend save fails, add layer locally only
        setLayers((prev) => {
          const exists = prev.some((layer) => layer.id === newLayer.id)
          if (exists) {
            return prev
          }
          return [...prev, newLayer]
        })
      }

      // If markerType is provided, update the layerMapping
      if (markerType) {
        setLayerMapping((prev) => ({
          ...prev,
          [newLayer.value]: markerType.toLowerCase(),
        }))
      }

      return newLayer
    } catch (error) {
      throw error // Пробрасываем ошибку дальше
    }
  }

  // Create New Site Alert function
  const showCreateNewSiteAlert = () => {
    // Проверяем, что presentAlert инициализирован
    if (typeof presentAlert !== "function" || typeof presentEmptyNameAlert !== "function") {
      return
    }

    presentAlert({
      header: "Create new site",
      cssClass: "create-site-alert",
      backdropDismiss: false, // Prevent closing on backdrop click
      inputs: [
        {
          name: "siteName",
          placeholder: "Enter a site name",
          type: "text",
          cssClass: s.alarm_actionInput,
          attributes: {
            required: true,
            minlength: 1,
          },
          value: "",
        },
      ],
      buttons: [
        {
          text: "CANCEL",
          role: "cancel",
          handler: () => {
            return true // Allow dialog to close
          },
        },
        {
          text: "CREATE",
          role: "confirm",
          handler: async (data: any) => {
            const siteName = data?.siteName || ""

            // If field is empty, show error alert
            if (!siteName || !siteName.trim()) {
              try {
                const result = await new Promise<boolean>((resolve) => {
                  presentEmptyNameAlert({
                    header: "Error",
                    message: "Site name cannot be empty",
                    backdropDismiss: false,
                    buttons: [
                      {
                        text: "Cancel",
                        role: "cancel",
                        handler: () => {
                          resolve(false) // Close both dialogs
                          return false
                        },
                      },
                      {
                        text: "Retry",
                        handler: () => {
                          resolve(true) // Keep create dialog open
                          return true
                        },
                      },
                    ],
                  })
                })

                return result // true to keep dialog open, false to close
              } catch (error) {
                return false // Close dialog on error
              }
            }

            // Check if site with this name already exists
            const siteExists = props.siteList.some((site) => site.name.toLowerCase() === siteName.toLowerCase())

            if (siteExists) {
              try {
                const result = await new Promise<boolean>((resolve) => {
                  presentEmptyNameAlert({
                    header: "Error",
                    message: "A site with this name already exists",
                    backdropDismiss: false,
                    buttons: [
                      {
                        text: "Cancel",
                        role: "cancel",
                        handler: () => {
                          resolve(false) // Close both dialogs
                          return false
                        },
                      },
                      {
                        text: "Retry",
                        handler: () => {
                          resolve(true) // Keep create dialog open
                          return true
                        },
                      },
                    ],
                  })
                })
                return result // true to keep dialog open, false to close
              } catch (error) {
                return false // Close dialog on error
              }
            }

            // For non-empty and unique names, proceed with site creation
            try {
              const result = await handleCreateNewSite(siteName)
              // Return true only if site was created successfully
              return result !== null
            } catch (error) {
              return false // Keep dialog open on error
            }
          },
        },
      ],
    })
  }

  // Create New Layer Alert function
  const showCreateNewLayerAlert = () => {
    // Reset form fields
    setNewLayerName("")
    setNewLayerMarkerType("fuel")
    setNewLayerTable("")
    setNewLayerColumn("")
    // Open modal
    setIsNewLayerModalOpen(true)
  }

  // Handle new layer creation from modal
  const handleFinishNewLayer = async () => {
    const layerName = newLayerName.trim()
    const markerType = newLayerMarkerType.trim()
    const table = newLayerTable.trim()
    const column = newLayerColumn.trim()

    // Validate Layer Name
    if (!layerName) {
      presentEmptyNameAlert({
        header: "Validation Error",
        message: "Layer name should not be empty",
        buttons: ["OK"],
      })
      return
    }

    // Validate Marker Type
    if (!markerType) {
      presentEmptyNameAlert({
        header: "Validation Error",
        message: "Marker Type should be selected",
        buttons: ["OK"],
      })
      return
    }

    // Validate Table
    if (!table) {
      presentEmptyNameAlert({
        header: "Validation Error",
        message: "Table should not be empty",
        buttons: ["OK"],
      })
      return
    }

    // Validate Column
    if (!column) {
      presentEmptyNameAlert({
        header: "Validation Error",
        message: "Column should not be empty",
        buttons: ["OK"],
      })
      return
    }

    // Check if layer with this name already exists
    const layerExists = layers.some((layer) => layer.name.toLowerCase() === layerName.toLowerCase())

    if (layerExists) {
      presentEmptyNameAlert({
        header: "Error",
        message: "A layer with this name already exists",
        buttons: ["OK"],
      })
      return
    }

    // For non-empty and unique names, proceed with layer creation
    try {
      const result = await handleCreateNewLayer(layerName, markerType, table, column)

      if (result !== null) {
        // Close modal on success
        setIsNewLayerModalOpen(false)
      }
    } catch (error) {
      presentEmptyNameAlert({
        header: "Error",
        message: "Failed to create layer",
        buttons: ["OK"],
      })
    }
  }

  // Выводим координаты при монтировании компонента

  // Логируем координаты при изменении выбранного сайта

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Initialize form with site when sites are loaded or when selected site changes

  // Function to grab coordinates from map center with rounding

  // Load layers when component mounts
  useEffect(() => {
    const loadLayers = async () => {
      setIsLoadingLayers(true)
      try {
        const layersData = await getLayers()
        setLayers(layersData.layers)
        setLayerMapping(layersData.mapping)
      } catch (error) {
      } finally {
        setIsLoadingLayers(false)
      }
    }

    loadLayers()
  }, [])

  // Fetch user site groups when navigating to Add Unit page

  // Handle site group error alert presentation at component level

  // Initialize Add Unit map when tab is active and API is loaded

  // Handle map resize when returning to Add Unit tab

  // Moist Marker Chart
  const isMoistMarkerChartDrawn: boolean = false
  const [moistChartDataContainer, setMoistChartDataContainer] = useState<ChartDataItem[]>([])
  const [invalidMoistChartDataContainer, setInvalidMoistChartDataContainer] = useState<ChartDataItem[]>([])
  const [moistOverlays, setMoistOverlays] = useState<OverlayItem[]>([])
  const moistOverlaysRef = useRef<any[]>([])
  const [currentSensorId, setCurrentSensorId] = useState<string | number>(0)
  const moistChartsAmount: ChartDataItem[] = []

  // Temp type
  const isTempMarkerChartDrawn: boolean = false
  const [tempChartDataContainer, setTempChartDataContainer] = useState<ChartDataItem[]>([])
  const [invalidTempChartDataContainer, setInvalidTempChartDataContainer] = useState<ChartDataItem[]>([])
  const [tempOverlays, setTempOverlays] = useState<OverlayItem[]>([])
  const tempChartsAmount: ChartDataItem[] = []

  // Valve type
  const isValveMarkerChartDrawn: boolean = false
  const [valveChartDataContainer, setValveChartDataContainer] = useState<ChartDataItem[]>([])
  const [invalidValveChartDataContainer, setInvalidValveChartDataContainer] = useState<ChartDataItem[]>([])
  const [valveOverlays, setValveOverlays] = useState<OverlayItem[]>([])
  const valveChartsAmount: ChartDataItem[] = []

  // Wxet type
  const isFuelMarkerChartDrawn: boolean = false
  const [wxetDataContainer, setWxetDataContainer] = useState<ChartDataItem[]>([])
  const [invalidWxetDataContainer, setInvalidWxetDataContainer] = useState<ChartDataItem[]>([])
  const [fuelOverlays, setFuelOverlays] = useState<OverlayItem[]>([])
  const wxetChartsAmount: ChartDataItem[] = []

  // EXTl type
  const [extlDataContainer, setExtlDataContainer] = useState<ExtlDataContainerItem[]>([])
  const extlChartsAmount: ChartDataItem[] = []

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

  // User location tracking
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [userLocationMarker, setUserLocationMarker] = useState<google.maps.Marker | null>(null)
  const [isLocationEnabled, setIsLocationEnabled] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // LayerList state
  const [checkedLayers, setCheckedLayers] = useState<{ [key: string]: boolean }>({})

  // QR Scanner state

  const history = useHistory()

  // Cleanup effect: Clear all overlays and sensor data when going back from sensors view
  const prevIsMarkerClickedRef = useRef<boolean | string | null>(null)

  useEffect(() => {
    // Skip on first mount (prevIsMarkerClickedRef.current === null)
    if (prevIsMarkerClickedRef.current === null) {
      prevIsMarkerClickedRef.current = isMarkerClicked
      return
    }

    // Only cleanup when transitioning from sensor view (was truthy) to site view (now false)
    const wasInSensorView = prevIsMarkerClickedRef.current !== false
    const isNowInSiteView = isMarkerClicked === false

    if (wasInSensorView && isNowInSiteView) {

      // Remove all overlays from the map using activeOverlays which contains all the overlay instances
      activeOverlays.forEach((overlay: OverlayItem) => {
        if (overlay && overlay.setMap && typeof overlay.setMap === "function") {
          try {
            overlay.setMap(null)
          } catch (error) {
            console.warn("Error removing overlay from map:", error)
          }
        }
      })

      // Clear all overlay state arrays
      setMoistOverlays([])
      setTempOverlays([])
      setValveOverlays([])
      setFuelOverlays([])
      setActiveOverlays([])
      setAllOverlays([])

      // Clear all data containers
      setMoistChartDataContainer([])
      setInvalidMoistChartDataContainer([])
      setTempChartDataContainer([])
      setInvalidTempChartDataContainer([])
      setValveChartDataContainer([])
      setInvalidValveChartDataContainer([])
      setWxetDataContainer([])
      setInvalidWxetDataContainer([])
      setExtlDataContainer([])

      // Reset other related state
      setCoordinatesForFitting([])
      setAllCoordinatesOfMarkers([])
      setAmountOfSensors(0)
      setAreBoundsFitted(false)

      // Clear moistOverlaysRef
      moistOverlaysRef.current = []

      // Clear site markers so createSites will recreate them
      // IMPORTANT: Remove old site markers from the map BEFORE clearing the state
      markers.forEach((marker: any) => {
        if (marker && marker.setMap) {
          marker.setMap(null)
        }
        if (marker && marker.infoWindow) {
          marker.infoWindow.close()
        }
      })
      setMarkers([])

      // Reset initialZoom so that createSites recalculates the proper zoom/center for all sites
      // This ensures the map fits all sites properly when returning from sensor view
      setInitialZoom(undefined)

    }

    // Update the ref to track the current state for the next render
    prevIsMarkerClickedRef.current = isMarkerClicked
  }, [isMarkerClicked, activeOverlays, markers])

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
    if (map && props.siteList.length > 0) {
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
    if (activeTab === "map" && map && mapRef.current) {
      // Force Google Maps to resize and redraw
      setTimeout(() => {
        if (map && mapRef.current) {
          google.maps.event.trigger(map, "resize")
          // Optionally recenter the map if needed
          if (coordinatesForFitting.length > 0) {
            const bounds = new google.maps.LatLngBounds()
            coordinatesForFitting.forEach((coord) => {
              bounds.extend(new google.maps.LatLng(coord.lat, coord.lng))
            })
            map.fitBounds(bounds)
          }
        }
      }, 100) // Small delay to ensure DOM is ready
    }
  }, [activeTab, map])

  // GPS Location functions
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      React.startTransition(() => {
        setLocationError("Geolocation is not supported by this browser.")
      })
      return
    }

    React.startTransition(() => {
      setLocationError(null)
    })

    // Try with high accuracy first, then fallback to low accuracy
    const tryHighAccuracy = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const newLocation = { lat: latitude, lng: longitude }

          // Use React.startTransition for safe state updates
          React.startTransition(() => {
            setUserLocation(newLocation)
            setIsLocationEnabled(true)
          })

          // Update marker after state is set
          requestAnimationFrame(() => {
            if (map) {
              updateUserLocationMarker(newLocation)
              // Removed auto-centering - user doesn't want map to jump automatically
            }
          })
        },
        (error) => {
          // Fallback to low accuracy
          tryLowAccuracy()
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // 1 minute
        },
      )
    }

    const tryLowAccuracy = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const newLocation = { lat: latitude, lng: longitude }

          // Use React.startTransition for safe state updates
          React.startTransition(() => {
            setUserLocation(newLocation)
            setIsLocationEnabled(true)
          })

          // Update marker after state is set
          requestAnimationFrame(() => {
            if (map) {
              updateUserLocationMarker(newLocation)
              // Removed auto-centering - user doesn't want map to jump automatically
            }
          })
        },
        (error) => {
          let errorMessage = "Unable to retrieve your location."
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please enable location permissions."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable."
              break
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again."
              break
          }

          // Use React.startTransition for safe state updates
          React.startTransition(() => {
            setLocationError(errorMessage)
            setIsLocationEnabled(false)
          })
        },
        {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 300000, // 5 minutes
        },
      )
    }

    // Start with high accuracy attempt
    tryHighAccuracy()
  }, [map])

  const updateUserLocationMarker = (location: { lat: number; lng: number }) => {
    if (!map) return

    // Remove existing marker if it exists
    if (userLocationMarker) {
      userLocationMarker.setMap(null)
    }

    // Create new marker for user location
    const marker = new google.maps.Marker({
      position: location,
      map: map,
      title: "Your Location",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#4285F4",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
      zIndex: 1000,
    })

    setUserLocationMarker(marker)
  }

  const centerMapOnUserLocation = useCallback(() => {
    if (userLocation && map) {
      requestAnimationFrame(() => {
        map.setCenter(userLocation)
        map.setZoom(16)
      })
    } else {
      // Try to get location if not available
      getCurrentLocation()
    }
  }, [userLocation, map, getCurrentLocation])

  // Initialize location on map load - ONLY ON MOBILE DEVICES
  useEffect(() => {
    // Check if device is mobile before initializing GPS
    const userAgent = navigator.userAgent
    const screenWidth = window.screen?.width || window.innerWidth
    const isMobileUserAgent =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|IEMobile|Opera Mini|Mobile|Tablet/i.test(userAgent)
    const isDesktop = /Windows NT|Macintosh|Linux/i.test(userAgent) && screenWidth > 1024
    const shouldInitializeLocation = isMobileUserAgent && !isDesktop

    // Initialize GPS ONLY on mobile devices when map is loaded
    if (map && activeTab === "map" && shouldInitializeLocation) {
      // Small delay to ensure map is fully rendered
      const timer = setTimeout(() => {
        getCurrentLocation()
      }, 1000)

      return () => clearTimeout(timer)
    }
    return () => {}
  }, [map, activeTab, getCurrentLocation])

  // Moist Marker Chart
  useEffect(() => {
    if (moistChartDataContainer.length !== 0) {
      moistChartDataContainer.map((chartData: ChartDataItem) => {
        const MoistCustomOverlayExport = initializeMoistCustomOverlay(props.isGoogleApiLoaded)
        const overlay = new MoistCustomOverlayExport(
          false,
          chartData[1],
          invalidChartDataImage,
          true,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history,
          isMoistMarkerChartDrawn,
          props.setAdditionalChartData,
          props.siteList,
          setMoistOverlays,
          props.setChartPageType,
          moistOverlaysRef,
          currentSensorId,
          setCurrentSensorId,
          false,
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, setActiveOverlays, map)
          })
        }
      })
    }
  }, [moistChartDataContainer])
  useEffect(() => {
    if (invalidMoistChartDataContainer.length !== 0) {
      invalidMoistChartDataContainer.map((chartData: ChartDataItem) => {
        const CustomOverlayExport = initializeMoistCustomOverlay(props.isGoogleApiLoaded)
        const overlay = new CustomOverlayExport(
          false,
          chartData[1],
          invalidChartDataImage,
          false,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history,
          isMoistMarkerChartDrawn,
          props.setAdditionalChartData,
          props.siteList,
          setMoistOverlays,
          props.setChartPageType,
          moistOverlaysRef,
          currentSensorId,
          setCurrentSensorId,
          false,
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, setActiveOverlays, map)
          })
        }
      })
    }
  }, [invalidMoistChartDataContainer])
  useEffect(() => {
    if (moistOverlays.length !== 0) {
      let roots: ChartRoot[] = []
      moistOverlays.map((moistOverlay: OverlayItem) => {
        createMoistChartForOverlay("m", moistOverlay.chartData, roots, moistOverlays)
      })
      return () => {
        roots.forEach((root) => root.dispose())
        roots = []
      }
    }
    return undefined
  }, [moistOverlays])

  // Wxet Marker
  useEffect(() => {
    if (wxetDataContainer.length !== 0) {
      wxetDataContainer.map((data: ChartDataItem) => {
        let overlay: OverlayItem | undefined
        if (data[0].markerType === "wxet") {
          const WxetCustomOverlayExport = initializeWxetCustomOverlay(props.isGoogleApiLoaded)
          if (!WxetCustomOverlayExport) return
          overlay = new WxetCustomOverlayExport(
            (data: unknown) => props.setChartData(data as SensorData[]),
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            props.setAdditionalChartData,
            history,
            data[1],
            true,
            data[0],
            props.setChartPageType,
          )
        } else if (data[0].markerType === "fuel") {
          const FuelCustomOverlayExport = initializeFuelCustomOverlay(props.isGoogleApiLoaded)
          if (!FuelCustomOverlayExport) return
          overlay = new FuelCustomOverlayExport(
            props.setChartData,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            history,
            data[1],
            true,
            data[0],
            props.setChartPageType,
            isFuelMarkerChartDrawn,
            setFuelOverlays,
          )
        }
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, setActiveOverlays, map)
          })
        }
      })
    }
  }, [wxetDataContainer])
  useEffect(() => {
    if (invalidWxetDataContainer.length !== 0) {
      invalidWxetDataContainer.map((data: ChartDataItem) => {
        let overlay: OverlayItem | undefined
        if (data[0].markerType === "wxet") {
          const WxetCustomOverlayExport = initializeWxetCustomOverlay(props.isGoogleApiLoaded)
          if (!WxetCustomOverlayExport) return
          overlay = new WxetCustomOverlayExport(
            props.setChartData,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            props.setAdditionalChartData,
            history,
            data[1],
            false,
            data[0],
            props.setChartPageType,
          )
        } else if (data[0].markerType === "fuel") {
          const FuelCustomOverlayExport = initializeFuelCustomOverlay(props.isGoogleApiLoaded)
          if (!FuelCustomOverlayExport) return
          overlay = new FuelCustomOverlayExport(
            props.setChartData,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            history,
            data[1],
            true,
            data[0],
            props.setChartPageType,
            isFuelMarkerChartDrawn,
            setFuelOverlays,
          )
        }

        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, setActiveOverlays, map)
          })
        }
      })
    }
  }, [invalidWxetDataContainer])

  useEffect(() => {
    if (fuelOverlays.length !== 0) {
      const roots: ChartRoot[] = []
      fuelOverlays.map((fuelOverlay: OverlayItem) => {
        createFuelChartForOverlay(fuelOverlay.chartData, roots, fuelOverlays)
      })

      return () => {
        roots.forEach((root) => root.dispose())
      }
    }
    return undefined
  }, [fuelOverlays])

  // Temp Marker
  useEffect(() => {
    if (tempChartDataContainer.length !== 0) {
      tempChartDataContainer.map((chartData: ChartDataItem) => {
        const TempCustomOverlayExport = initializeTempCustomOverlay(props.isGoogleApiLoaded)
        if (!TempCustomOverlayExport) return
        const overlay = new TempCustomOverlayExport(
          chartData[1],
          true,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history,
          isTempMarkerChartDrawn,
          props.setAdditionalChartData,
          setTempOverlays,
          props.setChartPageType,
          props.userId,
          present,
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, setActiveOverlays, map)
          })
        }
      })
    }
  }, [tempChartDataContainer])
  useEffect(() => {
    if (invalidTempChartDataContainer.length !== 0) {
      invalidTempChartDataContainer.map((chartData: ChartDataItem) => {
        const CustomOverlayExport = initializeTempCustomOverlay(props.isGoogleApiLoaded)
        if (!CustomOverlayExport) return
        const overlay = new CustomOverlayExport(
          chartData[1],
          false,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history,
          isTempMarkerChartDrawn,
          props.setAdditionalChartData,
          setTempOverlays,
          props.setChartPageType,
          props.userId,
          present,
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, setActiveOverlays, map)
          })
        }
      })
    }
    return undefined
  }, [invalidTempChartDataContainer])
  useEffect(() => {
    if (tempOverlays.length !== 0) {
      const roots: ChartRoot[] = []
      tempOverlays.map((tempOverlay: OverlayItem) => {
        createTempChartForOverlay(tempOverlay.chartData, roots, tempOverlays)
      })

      return () => {
        roots.forEach((root) => root.dispose())
      }
    }
    return undefined
  }, [tempOverlays])

  // Valve Marker
  useEffect(() => {
    if (valveChartDataContainer.length !== 0) {
      valveChartDataContainer.map((chartData: ChartDataItem) => {
        const ValveCustomOverlayExport = initializeValveCustomOverlay(props.isGoogleApiLoaded)
        if (!ValveCustomOverlayExport) return
        const overlay = new ValveCustomOverlayExport(
          chartData[1],
          true,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          props.setChartPageType,
          history,
          isValveMarkerChartDrawn,
          setValveOverlays,
          props.userId,
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, setActiveOverlays, map)
          })
        }
      })
    }
  }, [valveChartDataContainer])
  useEffect(() => {
    if (invalidValveChartDataContainer.length !== 0) {
      invalidValveChartDataContainer.map((chartData: ChartDataItem) => {
        const ValveCustomOverlayExport = initializeValveCustomOverlay(props.isGoogleApiLoaded)
        if (!ValveCustomOverlayExport) return
        const overlay = new ValveCustomOverlayExport(
          chartData[1],
          false,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          props.setChartPageType,
          history,
          isValveMarkerChartDrawn,
          setValveOverlays,
          props.userId,
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, setActiveOverlays, map)
          })
        }
      })
    }
    return undefined
  }, [invalidValveChartDataContainer])

  useEffect(() => {
    if (valveOverlays.length !== 0) {
      const roots: ChartRoot[] = []
      valveOverlays.map((valveOverlay: OverlayItem) => {
        createValveChartForOverlay(valveOverlay.chartData, roots, valveOverlays)
      })

      return () => {
        roots.forEach((root) => root.dispose())
      }
    }
    return undefined
  }, [valveOverlays])

  // EXTL Marker
  useEffect(() => {
    if (extlDataContainer.length !== 0) {
      extlDataContainer.map((data: ExtlDataContainerItem) => {
        const ExtlCustomOverlayExport = initializeExtlCustomOverlay(props.isGoogleApiLoaded)
        if (!ExtlCustomOverlayExport) return

        // Преобразуем данные для ExtlCustomOverlay
        const extlItem: ExtlSensorData = data[0] // Первый элемент - данные сенсора
        const extlBounds: ExtlBounds = data[1] // Второй элемент - bounds

        // Создаем LatLngBounds из extlBounds
        const bounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(extlItem.lat - 0.001, extlItem.lng - 0.001),
          new google.maps.LatLng(extlItem.lat + 0.001, extlItem.lng + 0.001),
        )

        // Преобразуем extlItem в ExtlChartData
        const extlChartData = {
          id: extlItem.sensorId,
          layerName: "EXTL",
          name: extlItem.name || `Sensor ${extlItem.sensorId}`,
          graphic: extlItem.graphic,
          chartType: "default",
          width: extlItem.width,
          height: extlItem.height,
          sensorId: extlItem.sensorId,
          mainId: extlItem.mainId,
        }

        const overlay = new ExtlCustomOverlayExport(bounds, extlChartData)
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, setActiveOverlays, map)
          })
        }
      })
    }
  }, [extlDataContainer])

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

  useEffect(() => {
    if (activeOverlays.length !== 0 && areBoundsFitted) {
      CollisionResolver.resolve(activeOverlays)
      const handleResize = () => {
        new Promise((resolve: () => void) => {
          activeOverlays.map((overlay: OverlayItem) => {
            overlay.offset = { x: 0, y: 0 }
          })
          resolve()
        }).then(() => {
          CollisionResolver.resolve(activeOverlays)
        })
      }
      window.addEventListener("resize", () => handleResize())
      map.addListener("zoom_changed", () => handleResize())
      return () => {
        window.removeEventListener("resize", handleResize)
        google.maps.event.clearListeners(map, "zoom_changed")
      }
    }
  }, [activeOverlays, areBoundsFitted])
  useEffect(() => {
    if (map) {
      if (activeTab !== "map") {
        const mapDivs = document.querySelectorAll(".gm-style")
        mapDivs.forEach((div) => {
          (div as HTMLElement).style.visibility = "hidden"
        })
      } else {
        const mapDivs = document.querySelectorAll(".gm-style")
        mapDivs.forEach((div) => {
          (div as HTMLElement).style.visibility = "visible"
        })
        google.maps.event.trigger(map, "resize")
      }
    }
  }, [activeTab, map])

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
              }}
            >
              <IonIcon icon={add} />
            </IonSegmentButton>
          </IonSegment>
        </div>

        <SensorSelector
          isOpen={isSensorModalOpen}
          onClose={handleCloseSensorModal}
          onConfirm={handleSensorSelect}
          selectedSensor={selectedSensor}
          sensors={availableSensors}
        />

        {/* New Layer Modal */}
        <IonModal isOpen={isNewLayerModalOpen} onDidDismiss={() => setIsNewLayerModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Create New Layer</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsNewLayerModalOpen(false)}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="stacked">Layer Name</IonLabel>
              <IonInput
                placeholder="Enter Layer Name"
                value={newLayerName}
                onIonInput={(e) => setNewLayerName(e.detail.value!)}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Marker Type</IonLabel>
              <IonSelect value={newLayerMarkerType} onIonChange={(e) => setNewLayerMarkerType(e.detail.value)}>
                <IonSelectOption value="fuel">Fuel marker</IonSelectOption>
                <IonSelectOption value="srs-green-fuel">SRS Green Fuel</IonSelectOption>
                <IonSelectOption value="srs-ref-fuel">SRS Reference Fuel</IonSelectOption>
                <IonSelectOption value="moist-fuel">Moisture Fuel</IonSelectOption>
                <IonSelectOption value="temp_rh">Temperature/Relative Humidity</IonSelectOption>
                <IonSelectOption value="temp-rh-v2">Temperature/RH Version 2</IonSelectOption>
                <IonSelectOption value="wxet">Weather Station ET</IonSelectOption>
                <IonSelectOption value="planthealth">Plant Health</IonSelectOption>
                <IonSelectOption value="soiltemp">Soil Temperature</IonSelectOption>
                <IonSelectOption value="psi">PSI (Pressure)</IonSelectOption>
                <IonSelectOption value="vfd">VFD (Variable Frequency Drive)</IonSelectOption>
                <IonSelectOption value="bflow">Budget/Flow</IonSelectOption>
                <IonSelectOption value="valve">Valve</IonSelectOption>
                <IonSelectOption value="graphic">Graphic</IonSelectOption>
                <IonSelectOption value="disease">Disease</IonSelectOption>
                <IonSelectOption value="pump">Pump</IonSelectOption>
                <IonSelectOption value="chemical">Chemical</IonSelectOption>
                <IonSelectOption value="infra-red">Infra-Red</IonSelectOption>
                <IonSelectOption value="neutron">Neutron</IonSelectOption>
                <IonSelectOption value="virtual-weather-station">Virtual Weather Station</IonSelectOption>
              </IonSelect>
            </IonItem>

            <div style={{ marginTop: "20px", marginBottom: "10px", fontWeight: "bold", color: "#666" }}>
              Data Source Configuration
            </div>

            <IonItem>
              <IonLabel position="stacked">Table</IonLabel>
              <IonInput
                placeholder="Table"
                value={newLayerTable}
                onIonInput={(e) => setNewLayerTable(e.detail.value!)}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Column</IonLabel>
              <IonInput
                placeholder="Column"
                value={newLayerColumn}
                onIonInput={(e) => setNewLayerColumn(e.detail.value!)}
              />
            </IonItem>

            <IonButton expand="block" onClick={handleFinishNewLayer} style={{ marginTop: "20px" }}>
              Finish
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  )
}

export default MapPage