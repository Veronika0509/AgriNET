/**
 * Site management utilities
 * Handles site creation and validation
 */

import type { Site, SiteId } from "../../../types"

export interface SiteValidationResult {
  isValid: boolean
  error?: string
}

export interface CreateSiteParams {
  siteName: string
  siteList: Site[]
  setSiteList: React.Dispatch<React.SetStateAction<Site[]>>
  setSelectedSite: (site: string) => void
  setSelectedSiteForAddUnit: (site: string) => void
  presentAlert: (options: any) => Promise<any>
}

/**
 * Validates if a site name is valid and unique
 */
export const isSiteNameValid = (siteName: string, siteList: Site[]): SiteValidationResult => {
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
 * Creates a new site
 */
export const handleCreateNewSite = async (params: CreateSiteParams): Promise<Site | null> => {
  const { siteName, siteList, setSiteList, setSelectedSite, setSelectedSiteForAddUnit, presentAlert } = params

  if (!siteName || !siteName.trim()) {
    return null
  }

  const validation = isSiteNameValid(siteName, siteList)

  if (!validation.isValid) {
    try {
      await presentAlert({
        header: "Error",
        message: validation.error || "Invalid site name",
        buttons: ["OK"],
      })
    } catch (error) {
      // Error showing alert
    }
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
    setSiteList((prev) => {
      const newList = [...prev, newSite]
      return newList
    })

    // Select the new site
    setSelectedSite(trimmedName)
    setSelectedSiteForAddUnit(trimmedName)

    return newSite
  } catch (error) {
    throw error
  }
}