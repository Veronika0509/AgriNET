import { useState, useRef } from "react"
import type { Coordinate, OverlayItem, ChartDataItem, ExtlDataContainerItem } from "../types"

/**
 * Custom hook for managing map-related state
 * Handles all map state including overlays, markers, coordinates, and chart data
 */
export const useMapState = () => {
  // Map state
  const [map, setMap] = useState<google.maps.Map | null>(null)
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
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768)

  // Marker clicked state
  const [isMarkerClicked, setIsMarkerClicked] = useState(false)
  const prevIsMarkerClickedRef = useRef<boolean | string | null>(null)

  // Chart data containers - Moist
  const [moistChartDataContainer, setMoistChartDataContainer] = useState<ChartDataItem[]>([])
  const [invalidMoistChartDataContainer, setInvalidMoistChartDataContainer] = useState<ChartDataItem[]>([])
  const [moistOverlays, setMoistOverlays] = useState<OverlayItem[]>([])
  const moistOverlaysRef = useRef<any[]>([])
  const [currentSensorId, setCurrentSensorId] = useState<string | number>(0)
  const moistChartsAmount: ChartDataItem[] = []

  // Chart data containers - Temp
  const [tempChartDataContainer, setTempChartDataContainer] = useState<ChartDataItem[]>([])
  const [invalidTempChartDataContainer, setInvalidTempChartDataContainer] = useState<ChartDataItem[]>([])
  const [tempOverlays, setTempOverlays] = useState<OverlayItem[]>([])
  const tempChartsAmount: ChartDataItem[] = []

  // Chart data containers - Valve
  const [valveChartDataContainer, setValveChartDataContainer] = useState<ChartDataItem[]>([])
  const [invalidValveChartDataContainer, setInvalidValveChartDataContainer] = useState<ChartDataItem[]>([])
  const [valveOverlays, setValveOverlays] = useState<OverlayItem[]>([])
  const valveChartsAmount: ChartDataItem[] = []

  // Chart data containers - Wxet/Fuel
  const [wxetDataContainer, setWxetDataContainer] = useState<ChartDataItem[]>([])
  const [invalidWxetDataContainer, setInvalidWxetDataContainer] = useState<ChartDataItem[]>([])
  const [fuelOverlays, setFuelOverlays] = useState<OverlayItem[]>([])
  const wxetChartsAmount: ChartDataItem[] = []

  // Chart data containers - EXTL
  const [extlDataContainer, setExtlDataContainer] = useState<ExtlDataContainerItem[]>([])
  const extlChartsAmount: ChartDataItem[] = []

  // Overlay state
  const [allCoordinatesOfMarkers, setAllCoordinatesOfMarkers] = useState<Coordinate[]>([])
  const [activeOverlays, setActiveOverlays] = useState<OverlayItem[]>([])
  const [allOverlays, setAllOverlays] = useState<OverlayItem[]>([])
  const [coordinatesForFitting, setCoordinatesForFitting] = useState<Coordinate[]>([])

  // Layer state
  const [checkedLayers, setCheckedLayers] = useState<{ [key: string]: boolean }>({})

  // Flags
  const [shouldRecreateMarkers, setShouldRecreateMarkers] = useState<boolean>(false)
  const [, setAreArraysUpdated] = useState(false)

  return {
    // Map
    map,
    setMap,
    initialZoom,
    setInitialZoom,
    markers,
    setMarkers,
    secondMap,
    setSecondMap,
    amountOfSensors,
    setAmountOfSensors,
    areBoundsFitted,
    setAreBoundsFitted,
    mapRef,
    mapInitialized,
    setMapInitialized,

    // User location
    userLocation,
    setUserLocation,
    userLocationMarker,
    setUserLocationMarker,
    isLocationEnabled,
    setIsLocationEnabled,
    locationError,
    setLocationError,
    isMobileView,
    setIsMobileView,

    // Marker clicked
    isMarkerClicked,
    setIsMarkerClicked,
    prevIsMarkerClickedRef,

    // Moist
    moistChartDataContainer,
    setMoistChartDataContainer,
    invalidMoistChartDataContainer,
    setInvalidMoistChartDataContainer,
    moistOverlays,
    setMoistOverlays,
    moistOverlaysRef,
    currentSensorId,
    setCurrentSensorId,
    moistChartsAmount,

    // Temp
    tempChartDataContainer,
    setTempChartDataContainer,
    invalidTempChartDataContainer,
    setInvalidTempChartDataContainer,
    tempOverlays,
    setTempOverlays,
    tempChartsAmount,

    // Valve
    valveChartDataContainer,
    setValveChartDataContainer,
    invalidValveChartDataContainer,
    setInvalidValveChartDataContainer,
    valveOverlays,
    setValveOverlays,
    valveChartsAmount,

    // Wxet/Fuel
    wxetDataContainer,
    setWxetDataContainer,
    invalidWxetDataContainer,
    setInvalidWxetDataContainer,
    fuelOverlays,
    setFuelOverlays,
    wxetChartsAmount,

    // EXTL
    extlDataContainer,
    setExtlDataContainer,
    extlChartsAmount,

    // Overlays
    allCoordinatesOfMarkers,
    setAllCoordinatesOfMarkers,
    activeOverlays,
    setActiveOverlays,
    allOverlays,
    setAllOverlays,
    coordinatesForFitting,
    setCoordinatesForFitting,

    // Layers
    checkedLayers,
    setCheckedLayers,

    // Flags
    shouldRecreateMarkers,
    setShouldRecreateMarkers,
    setAreArraysUpdated,
  }
}
