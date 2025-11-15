import { useCallback } from "react"
import { useIonAlert } from "@ionic/react"
import type { Site, SiteId } from "../../../types"

interface UseSiteManagementProps {
  siteList: Site[]
  setSiteList: React.Dispatch<React.SetStateAction<Site[]>>
  setSelectedSiteForAddUnit: React.Dispatch<React.SetStateAction<string>>
}

interface ValidationResult {
  isValid: boolean
  error?: string
}

export const useSiteManagement = ({
  siteList,
  setSiteList,
  setSelectedSiteForAddUnit,
}: UseSiteManagementProps) => {
  const [presentAlert] = useIonAlert()
  const [presentEmptyNameAlert] = useIonAlert()

  // Function to check if site name is valid
  const isSiteNameValid = useCallback(
    (siteName: string): ValidationResult => {
      if (!siteName || !siteName.trim()) {
        return { isValid: false, error: "Site name cannot be empty" }
      }

      const trimmedName = siteName.trim()
      const siteExists = siteList.some((site) => site.name.toLowerCase() === trimmedName.toLowerCase())

      if (siteExists) {
        return { isValid: false, error: "A site with this name already exists" }
      }

      return { isValid: true }
    },
    [siteList],
  )

  // Function to create a new site
  const handleCreateNewSite = useCallback(
    async (siteName: string): Promise<Site | null> => {
      if (!siteName || !siteName.trim()) {
        return null
      }

      const validation = isSiteNameValid(siteName)

      if (!validation.isValid) {
        try {
          await presentAlert({
            header: "Error",
            message: validation.error || "Invalid site name",
            buttons: ["OK"],
          })
        } catch (error) {}
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

        // Select the new site (for Add Unit container if needed)
        setSelectedSiteForAddUnit(trimmedName)

        return newSite
      } catch (error) {
        throw error
      }
    },
    [isSiteNameValid, presentAlert, setSiteList, setSelectedSiteForAddUnit],
  )

  // Create New Site Alert function
  const showCreateNewSiteAlert = useCallback(() => {
    if (typeof presentAlert !== "function" || typeof presentEmptyNameAlert !== "function") {
      return
    }

    presentAlert({
      header: "Create new site",
      cssClass: "create-site-alert",
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

            // If field is empty, show error alert
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

            // Check if site with this name already exists
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

            // For non-empty and unique names, proceed with site creation
            try {
              const result = await handleCreateNewSite(siteName)
              return result !== null
            } catch (error) {
              return false
            }
          },
        },
      ],
    })
  }, [presentAlert, presentEmptyNameAlert, siteList, handleCreateNewSite])

  return {
    isSiteNameValid,
    handleCreateNewSite,
    showCreateNewSiteAlert,
  }
}