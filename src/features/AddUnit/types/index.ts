import type { Site, UserId } from "../../../types"

export interface SiteGroup {
  id: number
  name: string
}

export interface Layer {
  id: string | number
  name: string
  value: string
}

export interface FormErrors {
  site: boolean
  siteGroup: boolean
  unitName: boolean
  latitude: boolean
  longitude: boolean
  sensor: boolean
  layer: boolean
}

export interface NewLayerConfigData {
  table: string
  column: string
  markerType: string
}

export type HTMLIonInputElement = HTMLElement & { value?: string | number | null }

export interface AddUnitTabProps {
  // Refs
  addUnitMapRef: React.RefObject<HTMLDivElement>

  // Map state
  addUnitMap: google.maps.Map | null
  crosshairMarker: google.maps.Marker | null

  // Props from parent
  userId: UserId
  siteList: Site[]
  setSiteList: React.Dispatch<React.SetStateAction<Site[]>>
  selectedSiteForAddUnit: string
  setSelectedSiteForAddUnit: (site: string) => void
  setSelectedMoistureSensor?: (sensor: any) => void
  setPage: (page: number) => void

  // Form state from useAddUnitForm hook
  unitName: string
  setUnitName: (value: string) => void
  unitLatitude: string
  setUnitLatitude: (value: string) => void
  unitLongitude: string
  setUnitLongitude: (value: string) => void
  selectedSite: string
  setSelectedSite: (value: string) => void
  selectedSiteGroup: string
  setSelectedSiteGroup: (value: string) => void
  siteGroups: SiteGroup[]
  setSiteGroups: React.Dispatch<React.SetStateAction<SiteGroup[]>>
  siteGroupError: { invalidGroup: string; correctGroups: string[] } | null
  setSiteGroupError: React.Dispatch<
    React.SetStateAction<{ invalidGroup: string; correctGroups: string[] } | null>
  >
  sensorPrefix: string
  setSensorPrefix: (value: string) => void
  sensorId: string
  setSensorId: (value: string) => void
  selectedLayer: string
  setSelectedLayer: (value: string) => void
  requestHardware: boolean
  setRequestHardware: (value: boolean) => void
  moistLevel: number | undefined
  setMoistLevel: (value: number | undefined) => void
  moistLevelError: boolean
  setMoistLevelError: (value: boolean) => void
  formErrors: FormErrors
  setFormErrors: React.Dispatch<React.SetStateAction<FormErrors>>
  validateSensorId: (sensorId: string) => { isValid: boolean; message?: string }
  getAllSensorIds: () => Promise<string[]>

  // Layer state
  layers: Array<Layer>
  setLayers: React.Dispatch<React.SetStateAction<Array<Layer>>>
  layerMapping: { [key: string]: string }
  setLayerMapping: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
  isLoadingLayers: boolean

  // QR Scanner state
  showQRScanner: boolean
  setShowQRScanner: (value: boolean) => void
  isQRScanned: boolean
  setIsQRScanned: (value: boolean) => void
  scannedSensorId: string
  setScannedSensorId: (value: string) => void
  qrTimezone: string
  setQrTimezone: (value: string) => void
  qrCustomFields: { [key: string]: any }
  setQrCustomFields: (value: { [key: string]: any }) => void
  qrBudgetLines: { [key: string]: any }
  setQrBudgetLines: (value: { [key: string]: any }) => void
  qrRawMetric: number
  setQrRawMetric: (value: number) => void
  qrDisplayMetric: number
  setQrDisplayMetric: (value: number) => void

  // New layer config state
  newLayerConfigData: NewLayerConfigData | undefined
  setNewLayerConfigData: React.Dispatch<React.SetStateAction<NewLayerConfigData | undefined>>
  tempLayerName: string | undefined
  setTempLayerName: (value: string | undefined) => void

  // New layer modal state
  isNewLayerModalOpen: boolean
  setIsNewLayerModalOpen: (value: boolean) => void
  newLayerName: string
  setNewLayerName: (value: string) => void
  newLayerMarkerType: string
  setNewLayerMarkerType: (value: string) => void
  newLayerTable: string
  setNewLayerTable: (value: string) => void
  newLayerColumn: string
  setNewLayerColumn: (value: string) => void
  handleFinishNewLayer: () => void

  // Markers state
  markers: google.maps.Marker[]
  setMarkers: React.Dispatch<React.SetStateAction<google.maps.Marker[]>>

  // Available sensors state
  availableSensors: any[]
  setAvailableSensors: (value: any[]) => void

  // Sensor modal state
  isSensorModalOpen: boolean
  setIsSensorModalOpen: (value: boolean) => void

  // Navigation state
  setActiveTab: (tab: string) => void
  setNavigationHistory: React.Dispatch<React.SetStateAction<string[]>>

  // Handler functions
  showCreateNewSiteAlert: () => void
  showCreateNewLayerAlert: () => void
  showPurchaseRequestAlert: () => void
}

export interface QRData {
  sensorId?: string
  name?: string
  siteName?: string
  site?: string
  lat?: number
  lng?: number
  lon?: number
  siteGroup?: string
  locall?: string
  local?: string
  timezone?: string
  customFields?: any
  budgetLines?: any
  rawMetric?: number
  displayMetric?: number
  SensorCount?: number
  sensorCount?: number
}

export interface UnitData {
  name: string
  lat: number
  lng: number
  userId: UserId
  site: string
  layer: string
  siteGroup?: string
  installDate: string
  timezone: string
  warnIfSensorIdExist: boolean
  askOverrideInstallDate: boolean
  requestHardware: boolean
  sensorId?: string
  sensorCount?: number
  newLayerConfig?: NewLayerConfigData
  datasource?: any
  customFields: { [key: string]: any }
  budgetLines: { [key: string]: any }
  rawMetric: number
  displayMetric: number
  pictureBase64: null
}