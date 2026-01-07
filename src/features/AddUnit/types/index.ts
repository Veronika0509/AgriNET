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

  // Props from parent
  userId: UserId
  siteList: Site[]
  setSiteList: React.Dispatch<React.SetStateAction<Site[]>>
  selectedSiteForAddUnit: string
  setSelectedSiteForAddUnit: React.Dispatch<React.SetStateAction<string>>
  setSelectedMoistureSensor?: React.Dispatch<React.SetStateAction<any>>
  setPage: React.Dispatch<React.SetStateAction<number>>

  // Form state from useAddUnitForm hook
  unitName: string
  setUnitName: React.Dispatch<React.SetStateAction<string>>
  unitLatitude: string
  setUnitLatitude: React.Dispatch<React.SetStateAction<string>>
  unitLongitude: string
  setUnitLongitude: React.Dispatch<React.SetStateAction<string>>
  selectedSite: string
  setSelectedSite: React.Dispatch<React.SetStateAction<string>>
  selectedSiteGroup: string
  setSelectedSiteGroup: React.Dispatch<React.SetStateAction<string>>
  siteGroups: SiteGroup[]
  setSiteGroups: React.Dispatch<React.SetStateAction<SiteGroup[]>>
  siteGroupError: { invalidGroup: string; correctGroups: string[] } | null
  setSiteGroupError: React.Dispatch<
    React.SetStateAction<{ invalidGroup: string; correctGroups: string[] } | null>
  >
  sensorPrefix: string
  setSensorPrefix: React.Dispatch<React.SetStateAction<string>>
  sensorId: string
  setSensorId: React.Dispatch<React.SetStateAction<string>>
  selectedLayer: string
  setSelectedLayer: React.Dispatch<React.SetStateAction<string>>
  requestHardware: boolean
  setRequestHardware: React.Dispatch<React.SetStateAction<boolean>>
  moistLevel: number | undefined
  setMoistLevel: React.Dispatch<React.SetStateAction<number | undefined>>
  moistLevelError: boolean
  setMoistLevelError: React.Dispatch<React.SetStateAction<boolean>>
  formErrors: FormErrors
  setFormErrors: React.Dispatch<React.SetStateAction<FormErrors>>
  validateSensorId: (sensorId: string) => { isValid: boolean; message?: string }
  getAllSensorIds: () => Promise<string[]>

  // Layer state
  layers: Array<{ id: string; name: string; value: string }>
  setLayers: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string; value: string }>>>
  layerMapping: { [key: string]: string }
  setLayerMapping: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
  isLoadingLayers: boolean

  // QR Scanner state
  showQRScanner: boolean
  setShowQRScanner: React.Dispatch<React.SetStateAction<boolean>>
  isQRScanned: boolean
  setIsQRScanned: React.Dispatch<React.SetStateAction<boolean>>
  scannedSensorId: string
  setScannedSensorId: React.Dispatch<React.SetStateAction<string>>
  qrTimezone: string
  setQrTimezone: React.Dispatch<React.SetStateAction<string>>
  qrCustomFields: { [key: string]: any }
  setQrCustomFields: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>
  qrBudgetLines: { [key: string]: any }
  setQrBudgetLines: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>
  qrRawMetric: number
  setQrRawMetric: React.Dispatch<React.SetStateAction<number>>
  qrDisplayMetric: number
  setQrDisplayMetric: React.Dispatch<React.SetStateAction<number>>

  // New layer config state
  newLayerConfigData: NewLayerConfigData | undefined
  setNewLayerConfigData: React.Dispatch<React.SetStateAction<NewLayerConfigData | undefined>>
  tempLayerName: string | undefined
  setTempLayerName: React.Dispatch<React.SetStateAction<string | undefined>>

  // New layer modal state
  isNewLayerModalOpen: boolean
  setIsNewLayerModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  newLayerName: string
  setNewLayerName: React.Dispatch<React.SetStateAction<string>>
  newLayerMarkerType: string
  setNewLayerMarkerType: React.Dispatch<React.SetStateAction<string>>
  newLayerTable: string
  setNewLayerTable: React.Dispatch<React.SetStateAction<string>>
  newLayerColumn: string
  setNewLayerColumn: React.Dispatch<React.SetStateAction<string>>
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