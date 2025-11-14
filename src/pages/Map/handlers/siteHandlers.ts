import type { Site, SiteId } from "../../../types"
import { isSiteNameValid } from "../utils/validation"

export interface CreateSiteOptions {
  siteName: string
  siteList: Site[]
  setSiteList: React.Dispatch<React.SetStateAction<Site[]>>
  setSelectedSite: (site: string) => void
  setSelectedSiteForAddUnit: (site: string) => void
  presentAlert: (options: any) => Promise<void>
}

export interface ShowCreateSiteAlertOptions {
  siteList: Site[]
  presentAlert: (options: any) => void
  presentEmptyNameAlert: (options: any) => void
  handleCreateNewSite: (siteName: string) => Promise<Site | null>
  cssClass?: string
}

/**
 * Creates a new site and updates the site list
 */
export const handleCreateNewSite = async (options: CreateSiteOptions): Promise<Site | null> => {
  const { siteName, siteList, setSiteList, setSelectedSite, setSelectedSiteForAddUnit, presentAlert } = options

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
      console.error("Error showing alert:", error)
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
    console.error("Error creating site:", error)
    throw error
  }
}

/**
 * Shows the create new site alert dialog
 */
export const showCreateNewSiteAlert = (options: ShowCreateSiteAlertOptions) => {
  const { siteList, presentAlert, presentEmptyNameAlert, handleCreateNewSite, cssClass } = options

  if (typeof presentAlert !== "function" || typeof presentEmptyNameAlert !== "function") {
    console.error("Alert functions not initialized")
    return
  }

  presentAlert({
    header: "Create new site",
    cssClass: cssClass || "create-site-alert",
    backdropDismiss: false,
    inputs: [
      {
        name: "siteName",
        placeholder: "Enter a site name",
        type: "text",
        attributes: {
          required: true,
          minlength: 1,
        },
        value: "",
      },
    ],
    buttons: [
      {
        text: "CANCEL",
        role: "cancel",
        handler: () => {
          return true
        },
      },
      {
        text: "CREATE",
        role: "confirm",
        handler: async (data: any) => {
          const siteName = data?.siteName || ""

          // Validate empty name
          if (!siteName || !siteName.trim()) {
            try {
              const result = await new Promise<boolean>((resolve) => {
                presentEmptyNameAlert({
                  header: "Error",
                  message: "Site name cannot be empty",
                  backdropDismiss: false,
                  buttons: [
                    {
                      text: "Cancel",
                      role: "cancel",
                      handler: () => {
                        resolve(false)
                        return false
                      },
                    },
                    {
                      text: "Retry",
                      handler: () => {
                        resolve(true)
                        return true
                      },
                    },
                  ],
                })
              })
              return result
            } catch (error) {
              return false
            }
          }

          // Check for duplicate names
          const siteExists = siteList.some((site) => site.name.toLowerCase() === siteName.toLowerCase())

          if (siteExists) {
            try {
              const result = await new Promise<boolean>((resolve) => {
                presentEmptyNameAlert({
                  header: "Error",
                  message: "A site with this name already exists",
                  backdropDismiss: false,
                  buttons: [
                    {
                      text: "Cancel",
                      role: "cancel",
                      handler: () => {
                        resolve(false)
                        return false
                      },
                    },
                    {
                      text: "Retry",
                      handler: () => {
                        resolve(true)
                        return true
                      },
                    },
                  ],
                })
              })
              return result
            } catch (error) {
              return false
            }
          }

          // Create the site
          try {
            const result = await handleCreateNewSite(siteName)
            return result !== null
          } catch (error) {
            console.error("Error in site creation handler:", error)
            return false
          }
        },
      },
    ],
  })
}