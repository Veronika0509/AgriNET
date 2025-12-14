import type { Site, UserId, SiteId } from "../../../types"
import type { FormErrors, NewLayerConfigData } from "../types"
import { getSiteList } from "../../../pages/Map/data/getSiteList"

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

export interface CreateUnitOptions {
  // Form state
  unitName: string
  unitLatitude: string
  unitLongitude: string
  selectedSite: string
  selectedSiteGroup: string
  selectedLayer: string
  fullSensorId: string
  moistLevel?: number
  requestHardware: boolean

  // QR state
  isQRScanned: boolean
  scannedSensorId: string
  qrTimezone: string
  qrCustomFields: { [key: string]: any }
  qrBudgetLines: { [key: string]: any }
  qrRawMetric: number
  qrDisplayMetric: number
  newLayerConfigData?: NewLayerConfigData

  // Props
  userId: UserId
  siteList: Site[]
  setSiteList: React.Dispatch<React.SetStateAction<Site[]>>

  // State setters for form clearing
  setUnitName: (name: string) => void
  setSensorId: (id: string) => void
  setSensorPrefix: (prefix: string) => void
  setSelectedLayer: (layer: string) => void
  setSelectedSiteGroup: (group: string) => void
  setMoistLevel: (level: number | undefined) => void
  setRequestHardware: (request: boolean) => void
  setFormErrors: React.Dispatch<React.SetStateAction<FormErrors>>
  setIsQRScanned: (scanned: boolean) => void
  setScannedSensorId: (id: string) => void
  setQrTimezone: (timezone: string) => void
  setQrCustomFields: (fields: { [key: string]: any }) => void
  setQrBudgetLines: (lines: { [key: string]: any }) => void
  setQrRawMetric: (metric: number) => void
  setQrDisplayMetric: (metric: number) => void
  setNewLayerConfigData: (data: NewLayerConfigData | undefined) => void
  setSiteGroupError: (error: { invalidGroup: string; correctGroups: string[] } | null) => void
  setTempLayerName: (name: string | undefined) => void

  // Map markers state
  markers: any[]
  setMarkers: React.Dispatch<React.SetStateAction<any[]>>
  setShowQRScanner: (show: boolean) => void
  setActiveTab: (tab: string) => void
  setNavigationHistory: React.Dispatch<React.SetStateAction<string[]>>

  // Alert functions
  presentAlert: (options: any) => void

  // Validation function
  validateSensorId: (sensorId: string) => { isValid: boolean; message?: string }
}

/**
 * Clears all form fields after successful unit creation
 */
export const clearFormFields = (options: Omit<CreateUnitOptions, "markers" | "validateSensorId">) => {
  const {
    setUnitName,
    setSensorId,
    setSensorPrefix,
    setSelectedLayer,
    setSelectedSiteGroup,
    setMoistLevel,
    setRequestHardware,
    setFormErrors,
    setIsQRScanned,
    setScannedSensorId,
    setQrTimezone,
    setQrCustomFields,
    setQrBudgetLines,
    setQrRawMetric,
    setQrDisplayMetric,
    setNewLayerConfigData,
    setTempLayerName,
  } = options

  // Clear text inputs
  setUnitName("")
  setSensorId("")
  setSensorPrefix("")

  // DON'T clear coordinate inputs - they show the map center position

  // Clear selectors
  setSelectedLayer("")
  setSelectedSiteGroup("")

  // Clear other form fields
  setMoistLevel(undefined)
  setRequestHardware(false)

  // Clear form errors
  setFormErrors({
    site: false,
    siteGroup: false,
    unitName: false,
    latitude: false,
    longitude: false,
    sensor: false,
    layer: false,
  })

  // Reset QR-related states
  setIsQRScanned(false)
  setScannedSensorId("")
  setQrTimezone("")
  setQrCustomFields({})
  setQrBudgetLines({})
  setQrRawMetric(0)
  setQrDisplayMetric(0)

  // Clear new layer config and temp layer name
  setNewLayerConfigData(undefined)
  setTempLayerName(undefined)
}

/**
 * Reloads site list and clears map markers
 */
export const reloadAndLogChanges = async (options: {
  userId: UserId
  markers: any[]
  setMarkers: React.Dispatch<React.SetStateAction<any[]>>
  setSiteList: React.Dispatch<React.SetStateAction<Site[]>>
  siteList: Site[]
  fullSensorId: string
  oldSiteList: any[]
}) => {
  const { userId, markers, setMarkers, setSiteList, siteList, fullSensorId, oldSiteList } = options

  // Fetch fresh site list data
  const sites = await getSiteList(userId)

  // Check if API call was successful
  if ("success" in sites && sites.success === false) {
    console.error("Failed to reload site list:", sites.error)
    return
  }

  // Clear existing markers
  markers.forEach((marker: any) => {
    if (marker && marker.setMap) {
      marker.setMap(null)
    }
    if (marker && marker.infoWindow) {
      marker.infoWindow.close()
    }
  })
  setMarkers([])

  // Update site list with fresh data
  setSiteList(sites.data)

  // Compare old and new site lists
  const newSites = siteList.filter((newSite: any) => !oldSiteList.some((oldSite: any) => oldSite.id === newSite.id))
  if (newSites.length > 0) {
  }

  const removedSites = oldSiteList.filter((oldSite: any) => !siteList.some((newSite: any) => newSite.id === oldSite.id))
  if (removedSites.length > 0) {
  }

  // Check for modified sites
  siteList.forEach((newSite: any) => {
    const oldSite = oldSiteList.find((old: any) => old.id === newSite.id)
    if (oldSite) {
      const oldLayers = oldSite.layers || []
      const newLayers = newSite.layers || []

      if (oldLayers.length !== newLayers.length) {
      }

      // Check each layer for new markers
      newLayers.forEach((newLayer: any) => {
        const oldLayer = oldLayers.find((old: any) => old.name === newLayer.name)

        if (oldLayer) {
          const oldMarkers = oldLayer.markers || []
          const newMarkers = newLayer.markers || []

          if (oldMarkers.length !== newMarkers.length) {
            const addedMarkers = newMarkers.filter(
              (newMarker: any) =>
                !oldMarkers.some((oldMarker: any) => oldMarker.chartData?.sensorId === newMarker.chartData?.sensorId),
            )
          }
        }
      })
    }
  })

  // Search for the new unit
  siteList.forEach((site: any) => {
    if (site.layers) {
      site.layers.forEach((layer: any) => {
        if (layer.markers) {
          const foundMarker = layer.markers.find(
            (marker: any) => marker.chartData && marker.chartData.sensorId === fullSensorId,
          )
          if (foundMarker) {
          }
        }
      })
    }
  })
}

/**
 * Creates a new unit with comprehensive validation and error handling
 */
export const createUnit = async (
  options: CreateUnitOptions,
  overrideFlags?: {
    warnIfSensorIdExist?: boolean
    askOverrideInstallDate?: boolean
  },
) => {
  const {
    unitName,
    unitLatitude,
    unitLongitude,
    selectedSite,
    selectedSiteGroup,
    selectedLayer,
    fullSensorId,
    moistLevel,
    requestHardware,
    isQRScanned,
    scannedSensorId,
    qrTimezone,
    qrCustomFields,
    qrBudgetLines,
    qrRawMetric,
    qrDisplayMetric,
    newLayerConfigData,
    userId,
    siteList,
    setSiteList,
    markers,
    setMarkers,
    setShowQRScanner,
    setActiveTab,
    setNavigationHistory,
    presentAlert,
    setSiteGroupError,
  } = options

  // Get current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split("T")[0]

  // Determine timezone: QR code first, then browser timezone
  const timezone = qrTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone

  // Check if sensor ID was modified after QR scan
  const sensorIdModified = isQRScanned && scannedSensorId && scannedSensorId !== fullSensorId

  const unitData: UnitData = {
    // Required Fields
    name: unitName,
    lat: Number.parseFloat(unitLatitude),
    lng: Number.parseFloat(unitLongitude),
    userId: userId,
    site: selectedSite,
    layer: selectedLayer,
    siteGroup: selectedSiteGroup || undefined,
    installDate: currentDate,
    timezone: timezone,
    warnIfSensorIdExist:
      overrideFlags?.warnIfSensorIdExist !== undefined
        ? overrideFlags.warnIfSensorIdExist
        : !isQRScanned || sensorIdModified,
    askOverrideInstallDate:
      overrideFlags?.askOverrideInstallDate !== undefined ? overrideFlags.askOverrideInstallDate : true,
    requestHardware: requestHardware,

    // Optional Fields
    sensorId: fullSensorId || undefined,
    sensorCount: selectedLayer.toLowerCase() === "moist" ? moistLevel : undefined,
    newLayerConfig: newLayerConfigData || undefined,
    datasource: undefined,
    customFields: qrCustomFields,
    budgetLines: qrBudgetLines,
    rawMetric: qrRawMetric,
    displayMetric: qrDisplayMetric,
    pictureBase64: null,
  }

  try {
    // Make POST request to add unit
    const response = await fetch("https://app.agrinet.us/api/add-unit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        User: userId.toString(),
      },
      body: JSON.stringify(unitData),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(errorData.message || `Failed to add unit: ${response.statusText}`)
    }

    const result = await response.json()

    // Check if the operation was successful
    if (result.success === false) {
      // Handle sensor ID already exists
      if (result.sensorIdExistWarn === true) {
        const layers = result.sensorIdExistOnLayer || []
        const layerText =
          layers.length > 0 ? `the ${layers.join(", ")} layer${layers.length > 1 ? "s" : ""}` : "another layer"

        setTimeout(() => {
          presentAlert({
            header: "⚠️ Warning",
            message: `This sensor ID already exist in ${layerText}`,
            buttons: [
              {
                text: "Cancel",
                role: "cancel",
              },
              {
                text: "Continue",
                handler: () => {
                  createUnit(options, {
                    warnIfSensorIdExist: false,
                    askOverrideInstallDate: overrideFlags?.askOverrideInstallDate,
                  })
                },
              },
            ],
          })
        }, 100)
        return
      }

      // Handle install date conflict
      if (result.askOverrideInstallDate === true) {
        const existingDate = result.installDate || "unknown date"

        setTimeout(async () => {
          try {
            await presentAlert({
              header: "Warning",
              message: `This sensor already exist and has install data: ${existingDate}, override this by current date?`,
              buttons: [
                {
                  text: "Cancel",
                  role: "cancel",
                  handler: () => {},
                },
                {
                  text: "Override install date",
                  handler: () => {
                    createUnit(options, {
                      warnIfSensorIdExist: overrideFlags?.warnIfSensorIdExist,
                      askOverrideInstallDate: false,
                    })
                  },
                },
              ],
            })
          } catch (error) {
            console.error("Error presenting alert:", error)
          }
        }, 100)
        return
      }

      // Handle site group access issue
      if (result.userNotInSiteGroup === true) {
        const invalidGroup = result.siteGroup || selectedSiteGroup
        const correctGroups = result.userSiteGroups || []

        setTimeout(() => {
          setSiteGroupError({
            invalidGroup: invalidGroup,
            correctGroups: correctGroups,
          })
        }, 300)

        return
      }

      // General error
      const errorMessage = result.error || "Failed to add unit. Please try again."
      presentAlert({
        header: "❌ Error",
        message: errorMessage,
        buttons: ["Close"],
      })
      return
    }

    // Success! Store old site list for comparison
    const oldSiteList = JSON.parse(JSON.stringify(siteList))

    // Show success alert
    setTimeout(() => {
      presentAlert({
        header: "✓ Added",
        message: "Unit successfully added.\nDo you want create another one?",
        backdropDismiss: false,
        buttons: [
          {
            text: "To map",
            handler: async () => {
              setShowQRScanner(false)
              clearFormFields(options)

              await reloadAndLogChanges({
                userId,
                markers,
                setMarkers,
                setSiteList,
                siteList,
                fullSensorId,
                oldSiteList,
              })

              setTimeout(() => {
                setActiveTab("map")
                setNavigationHistory((prev) => prev.slice(0, -1))
              }, 100)
            },
          },
          {
            text: "Add next",
            handler: () => {
              clearFormFields(options)
            },
          },
        ],
      })
    }, 100)
  } catch (error) {
    console.error("Error adding unit:", error)

    presentAlert({
      header: "Error",
      message: error instanceof Error ? error.message : "Failed to add unit. Please try again.",
      buttons: ["OK"],
    })
  }
}

/**
 * Validates sensor ID and creates unit
 */
export const validateAndCreateUnit = (options: CreateUnitOptions) => {
  const { fullSensorId, validateSensorId, presentAlert } = options

  const validation = validateSensorId(fullSensorId)

  if (!validation.isValid) {
    presentAlert({
      header: "Sensor ID Validation Warning",
      message: validation.message,
      cssClass: "sensor-id-validation-alert",
      buttons: [
        {
          text: "ACCEPT ANYWAY",
          cssClass: "alert-button-confirm",
          handler: () => {
            createUnit(options)
          },
        },
        {
          text: "CANCEL SAVING",
          role: "cancel",
          cssClass: "alert-button-cancel",
        },
      ],
    })
  } else {
    createUnit(options)
  }
}