import type { Site, SensorData, ChartPageType, UserId, SiteId } from "../../../types"
import type { OverlayItem } from "./OverlayItem"

// LayerList interfaces
export interface LayerListLayer {
  name: string
  markers: LayerListMarker[]
  [key: string]: unknown
}

export interface LayerListMarker {
  chartData: {
    sensorId: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

// Extend Site interface to include layers
export interface SiteWithLayers extends Site {
  layers?: LayerListLayer[]
}

// Chart data types (using unknown for now to avoid compilation errors)
export type MoistChartData = unknown
export type FuelChartData = unknown
export type TempChartData = unknown

// Extl data types
export interface ExtlSensorData {
  sensorId: string
  name?: string
  lat: number
  lng: number
  graphic?: unknown
  width?: number
  height?: number
  [key: string]: unknown
}

export interface ExtlBounds {
  lat: number
  lng: number
  [key: string]: unknown
}

export type ExtlDataContainerItem = [ExtlSensorData, ExtlBounds]

// Custom overlay constructor type
export type CustomOverlayConstructor = {
  new (...args: any[]): OverlayItem
}

// Chart data with bounds type
export type ChartDataWithBounds<T> = [T, google.maps.LatLngBounds]

// Marker type
export type Marker = {
  position: google.maps.LatLngLiteral
  id: string | number
  type: string
  [key: string]: unknown
}

export interface ChartDataItem {
  sensorId: string
  markerType?: string
  [key: string]: unknown
}

// Base interface for custom overlays
export interface BaseOverlay {
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
  sensorId: string
  layerName: string
  [key: string]: unknown
}

export interface Coordinate {
  lat: number
  lng: number
}

// Interface for chart data bounds
export interface ChartBounds {
  north: number
  south: number
  east: number
  west: number
}

// Interface for amCharts root elements
export interface ChartRoot {
  dispose: () => void
  [key: string]: unknown
}

// Interface for API responses
export interface ApiResponse<T> {
  data: T
}

// Type for sensor data point
export interface DataPoint {
  date: Date | string | number
  value: number
  [key: string]: unknown
}

export interface MapProps {
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

// HTML Element type extensions
export interface HTMLIonIconElement extends HTMLElement {
  icon?: string
  color?: string
}

export interface HTMLIonInputElement extends HTMLElement {
  value?: string | number | null
}

// Site group interface
export interface SiteGroup {
  id: string | number
  name: string
}

// Layer interface
export interface Layer {
  id: string | number
  name: string
  value: string
}

// Layer mapping type
export type LayerMapping = { [key: string]: string }

// Form errors type
export interface FormErrors {
  [key: string]: string | undefined
}

// New layer configuration
export interface NewLayerConfigData {
  table: string
  column: string
  markerType: string
}