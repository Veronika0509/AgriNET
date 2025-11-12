/**
 * Sensor ID validation utilities
 * Handles validation and verification of sensor IDs
 */

export interface SensorValidationResult {
  isValid: boolean
  message?: string
}

export interface SensorExistsResult {
  exists: boolean
  layers: string[]
}

/**
 * Validates sensor ID format
 * Accepts formats: 2900XXXXX, 24XXXXXXX, TSGXXXXX, or ANMXXXXX
 */
export const validateSensorId = (fullSensorId: string): SensorValidationResult => {
  // Check format: 2900 + exactly 5 digits
  if (/^2900\d{5}$/.test(fullSensorId)) {
    return { isValid: true }
  }

  // Check format: 24 + any 2 digits + exactly 5 digits (total 9 digits)
  if (/^24\d{7}$/.test(fullSensorId)) {
    return { isValid: true }
  }

  // Check format: TSG + exactly 5 digits
  if (/^TSG\d{5}$/.test(fullSensorId)) {
    return { isValid: true }
  }

  // Check format: ANM + exactly 5 digits
  if (/^ANM\d{5}$/.test(fullSensorId)) {
    return { isValid: true }
  }

  // If validation failed
  return {
    isValid: false,
    message: "Sensor ID does not correspond mask: 2900XXXXX, 24XXXXXXX, TSGXXXXX or ANMXXXXX",
  }
}

/**
 * Fetches all existing sensor IDs from the API
 */
export const getAllSensorIds = async (): Promise<string[]> => {
  try {
    const response = await fetch("https://app.agrinet.us/api/utils/all-sensor-ids")
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching all sensor IDs:", error)
    return []
  }
}

/**
 * Checks if a sensor ID exists in the system and retrieves its layers
 */
export const checkSensorIdExists = async (sensorId: string): Promise<SensorExistsResult> => {
  const allSensorIds = await getAllSensorIds()

  // API returns array of strings, check if sensor ID is in the array
  const exists = allSensorIds.includes(sensorId)

  if (exists) {
    try {
      const response = await fetch(`https://app.agrinet.us/api/utils/${sensorId}`)
      if (response.ok) {
        const data = await response.json()

        // API returns array of objects, each object has a layer field
        let layers: string[] = []
        if (Array.isArray(data)) {
          layers = data
            .filter((item) => item.layer) // Only take objects with layer field
            .map((item) => item.layer)
        }

        return {
          exists: true,
          layers: layers.length > 0 ? layers : ["Unknown"],
        }
      }
    } catch (error) {
      console.error("Error fetching sensor info:", error)
    }

    return {
      exists: true,
      layers: ["Unknown"],
    }
  }

  return {
    exists: false,
    layers: [],
  }
}