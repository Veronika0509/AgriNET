import type { Site, SiteId } from "../../../types"

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

export interface QRScanHandlers {
  setSensorPrefix: (prefix: string) => void
  setSensorId: (id: string) => void
  setUnitName: (name: string) => void
  setUnitLatitude: (lat: string) => void
  setUnitLongitude: (lng: string) => void
  setSelectedSite: (site: string) => void
  setSelectedSiteForAddUnit: (site: string) => void
  setSelectedSiteGroup: (group: string) => void
  setSelectedLayer: (layer: string) => void
  setMoistLevel: (level: number) => void
  setScannedSensorId: (id: string) => void
  setQrTimezone: (tz: string) => void
  setQrCustomFields: (fields: any) => void
  setQrBudgetLines: (lines: any) => void
  setQrRawMetric: (metric: number) => void
  setQrDisplayMetric: (metric: number) => void
  setSiteGroups: React.Dispatch<React.SetStateAction<{ id: number; name: string }[]>>
  handleCreateNewSite: (siteName: string) => Promise<Site | null>
}

/**
 * Handles QR code data from JSON format
 * @param data - Parsed JSON data from QR code
 * @param siteList - Current list of sites
 * @param handlers - Object containing all setter functions
 */
export const handleJSONQRData = (data: QRData, siteList: Site[], handlers: QRScanHandlers) => {
  // Extract and store QR-specific data fields
  if (data.timezone) {
    handlers.setQrTimezone(data.timezone)
  }
  if (data.customFields && typeof data.customFields === "object") {
    handlers.setQrCustomFields(data.customFields)
  }
  if (data.budgetLines && typeof data.budgetLines === "object") {
    handlers.setQrBudgetLines(data.budgetLines)
  }
  if (data.rawMetric !== undefined) {
    handlers.setQrRawMetric(Number(data.rawMetric) || 0)
  }
  if (data.displayMetric !== undefined) {
    handlers.setQrDisplayMetric(Number(data.displayMetric) || 0)
  }

  // Populate form fields from JSON data
  if (data.sensorId) {
    // Extract prefix and numeric part from sensor ID
    const sensorIdStr = String(data.sensorId)
    handlers.setScannedSensorId(sensorIdStr)
    const match = sensorIdStr.match(/^([A-Z]+)?(\d+)$/)
    if (match) {
      const [, prefix = "", numeric] = match
      handlers.setSensorPrefix(prefix)
      handlers.setSensorId(numeric)
    } else {
      handlers.setSensorId(sensorIdStr)
    }
  }
  if (data.name) handlers.setUnitName(data.name)
  if (data.lat) handlers.setUnitLatitude(String(data.lat))
  if (data.lng || data.lon) handlers.setUnitLongitude(String(data.lng || data.lon))

  // Handle site name from QR data
  if (data.siteName || data.site) {
    const qrSiteName = data.siteName || data.site
    console.log("Site Name from QR:", qrSiteName)

    const siteExists = siteList.some((site) => site.name.toLowerCase() === qrSiteName.toLowerCase())

    if (siteExists) {
      console.log("Site exists, selecting:", qrSiteName)
      handlers.setSelectedSite(qrSiteName)
      handlers.setSelectedSiteForAddUnit(qrSiteName)

      const site = siteList.find((s) => s.name.toLowerCase() === qrSiteName.toLowerCase())
      if (site && site.lat && site.lng) {
        handlers.setUnitLatitude(String(site.lat))
        handlers.setUnitLongitude(String(site.lng))
      }
    } else {
      console.log("Site does not exist, creating:", qrSiteName)
      handlers.handleCreateNewSite(qrSiteName)
    }
  }

  // Set siteGroup from JSON data
  if (data.siteGroup) {
    handlers.setSelectedSiteGroup(data.siteGroup)

    handlers.setSiteGroups((prevGroups) => {
      const groupExists = prevGroups.some((g) => g.name === data.siteGroup)
      if (!groupExists) {
        const newGroup = {
          id: prevGroups.length + 1,
          name: data.siteGroup,
        }
        return [...prevGroups, newGroup]
      }
      return prevGroups
    })
  }

  // Set layer from JSON data
  if (data.locall || data.local) {
    const layerValue = data.locall || data.local
    const capitalizedLayer = layerValue.charAt(0).toUpperCase() + layerValue.slice(1).toLowerCase()
    handlers.setSelectedLayer(capitalizedLayer)
  }
}

/**
 * Handles QR code data from key-value pair format
 * @param decodedText - Raw QR code text
 * @param siteList - Current list of sites
 * @param handlers - Object containing all setter functions
 */
export const handleKeyValueQRData = (decodedText: string, siteList: Site[], handlers: QRScanHandlers) => {
  const qrData = decodedText.trim()

  // Parse key-value pairs
  const pairs = qrData.split(",").map((pair) => pair.trim())
  const parsedData: { [key: string]: string } = {}

  pairs.forEach((pair) => {
    const [key, value] = pair.split("=").map((s) => s.trim())
    if (key && value) {
      parsedData[key] = value
    }
  })

  // Extract individual fields
  const qrSensorId = parsedData["sensorid"] || parsedData["sensorId"] || ""
  const qrName = parsedData["name"] || parsedData["Name"] || ""
  const qrSiteName = parsedData["siteName"] || parsedData["site"] || parsedData["Site"] || ""
  const qrLocall = parsedData["locall"] || parsedData["local"] || ""
  const qrSensorCount = parsedData["SensorCount"] || parsedData["sensorCount"] || ""
  const qrSiteGroup = parsedData["siteGroup"] || parsedData["SiteGroup"] || ""
  const qrTimezoneValue = parsedData["timezone"] || parsedData["Timezone"] || ""
  const qrCustomFieldsValue = parsedData["customFields"] || ""
  const qrBudgetLinesValue = parsedData["budgetLines"] || ""
  const qrRawMetricValue = parsedData["rawMetric"] || ""
  const qrDisplayMetricValue = parsedData["displayMetric"] || ""

  // Extract and store QR-specific data fields
  if (qrTimezoneValue) {
    handlers.setQrTimezone(qrTimezoneValue)
  }
  if (qrCustomFieldsValue) {
    try {
      const customFields = JSON.parse(qrCustomFieldsValue)
      if (typeof customFields === "object") {
        handlers.setQrCustomFields(customFields)
      }
    } catch {
      // If not valid JSON, ignore
    }
  }
  if (qrBudgetLinesValue) {
    try {
      const budgetLines = JSON.parse(qrBudgetLinesValue)
      if (typeof budgetLines === "object") {
        handlers.setQrBudgetLines(budgetLines)
      }
    } catch {
      // If not valid JSON, ignore
    }
  }
  if (qrRawMetricValue) {
    handlers.setQrRawMetric(Number(qrRawMetricValue) || 0)
  }
  if (qrDisplayMetricValue) {
    handlers.setQrDisplayMetric(Number(qrDisplayMetricValue) || 0)
  }

  // Set Unit Name
  if (qrName) {
    handlers.setUnitName(qrName)
  }

  // Handle site name from QR data
  if (qrSiteName) {
    console.log("Site Name from QR:", qrSiteName)

    const siteExists = siteList.some((site) => site.name.toLowerCase() === qrSiteName.toLowerCase())

    if (siteExists) {
      console.log("Site exists, selecting:", qrSiteName)
      handlers.setSelectedSite(qrSiteName)
      handlers.setSelectedSiteForAddUnit(qrSiteName)

      const site = siteList.find((s) => s.name.toLowerCase() === qrSiteName.toLowerCase())
      if (site && site.lat && site.lng) {
        handlers.setUnitLatitude(String(site.lat))
        handlers.setUnitLongitude(String(site.lng))
      }
    } else {
      console.log("Site does not exist, creating:", qrSiteName)
      handlers.handleCreateNewSite(qrSiteName)
    }
  }

  // Handle Sensor ID - extract prefix and numeric part
  if (qrSensorId) {
    handlers.setScannedSensorId(qrSensorId)
    const sensorIdMatch = qrSensorId.match(/^([A-Z]+)?(\d+)$/)
    if (sensorIdMatch) {
      const [, prefix = "", numeric] = sensorIdMatch
      handlers.setSensorPrefix(prefix)
      handlers.setSensorId(numeric)
    } else {
      handlers.setSensorId(qrSensorId)
    }
  }

  // Set Layer (locall field)
  if (qrLocall) {
    const capitalizedLayer = qrLocall.charAt(0).toUpperCase() + qrLocall.slice(1).toLowerCase()
    handlers.setSelectedLayer(capitalizedLayer)
  }

  // Set Sensor Count for Moist sensors
  if (qrSensorCount) {
    const count = Number.parseInt(qrSensorCount, 10)
    if (!isNaN(count)) {
      handlers.setMoistLevel(count)
    }
  }

  // Set Site Group
  if (qrSiteGroup) {
    handlers.setSelectedSiteGroup(qrSiteGroup)

    handlers.setSiteGroups((prevGroups) => {
      const groupExists = prevGroups.some((g) => g.name === qrSiteGroup)
      if (!groupExists) {
        const newGroup = {
          id: prevGroups.length + 1,
          name: qrSiteGroup,
        }
        return [...prevGroups, newGroup]
      }
      return prevGroups
    })
  }
}