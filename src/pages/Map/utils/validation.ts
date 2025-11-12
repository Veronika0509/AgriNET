import type { Site } from "../../../types"
import type { Layer } from "../types"

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validates if a site name is valid (non-empty and unique)
 */
export const isSiteNameValid = (siteName: string, siteList: Site[]): ValidationResult => {
  if (!siteName || !siteName.trim()) {
    return { isValid: false, error: "Site name cannot be empty" }
  }

  const trimmedName = siteName.trim()
  const siteExists = siteList.some((site) => site.name.toLowerCase() === trimmedName.toLowerCase())

  if (siteExists) {
    return { isValid: false, error: "A site with this name already exists" }
  }

  return { isValid: true }
}

/**
 * Validates if a layer name is valid (non-empty and unique)
 */
export const isLayerNameValid = (layerName: string, layers: Layer[]): ValidationResult => {
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

/**
 * Validates unit name (non-empty)
 */
export const isUnitNameValid = (unitName: string): ValidationResult => {
  if (!unitName || !unitName.trim()) {
    return { isValid: false, error: "Unit name cannot be empty" }
  }

  return { isValid: true }
}

/**
 * Validates latitude value
 */
export const isLatitudeValid = (latitude: string): ValidationResult => {
  if (!latitude) {
    return { isValid: false, error: "Latitude is required" }
  }

  const lat = parseFloat(latitude)
  if (isNaN(lat)) {
    return { isValid: false, error: "Latitude must be a valid number" }
  }

  if (lat < -90 || lat > 90) {
    return { isValid: false, error: "Latitude must be between -90 and 90" }
  }

  return { isValid: true }
}

/**
 * Validates longitude value
 */
export const isLongitudeValid = (longitude: string): ValidationResult => {
  if (!longitude) {
    return { isValid: false, error: "Longitude is required" }
  }

  const lng = parseFloat(longitude)
  if (isNaN(lng)) {
    return { isValid: false, error: "Longitude must be a valid number" }
  }

  if (lng < -180 || lng > 180) {
    return { isValid: false, error: "Longitude must be between -180 and 180" }
  }

  return { isValid: true }
}

/**
 * Validates moisture level count
 */
export const isMoistLevelValid = (moistLevel: number | undefined, markerType: string): ValidationResult => {
  if (markerType === "moist") {
    if (moistLevel === undefined || moistLevel === null) {
      return { isValid: false, error: "Moisture sensor count is required" }
    }

    if (moistLevel < 1 || moistLevel > 32) {
      return { isValid: false, error: "Moisture sensor count must be between 1 and 32" }
    }
  }

  return { isValid: true }
}