import type { Site } from "../../../types"

/**
 * Validates if a site name is valid and unique
 * @param siteName - The site name to validate
 * @param siteList - The current list of sites
 * @returns Validation result with isValid flag and optional error message
 */
export const isSiteNameValid = (
  siteName: string,
  siteList: Site[]
): { isValid: boolean; error?: string } => {
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
 * Validates if a layer name is valid and unique
 * @param layerName - The layer name to validate
 * @param layers - The current list of layers
 * @returns Validation result with isValid flag and optional error message
 */
export const isLayerNameValid = (
  layerName: string,
  layers: Array<{ id: string; name: string; value: string }>
): { isValid: boolean; error?: string } => {
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