import { useEffect } from "react"

/**
 * Custom hook for fetching user site groups when Add Unit tab is active
 * @param activeTab - Current active tab
 * @param setSiteGroups - Setter for site groups state
 * @param setSelectedSiteGroup - Setter for selected site group
 */
export const useSiteGroups = (
  activeTab: string,
  setSiteGroups: React.Dispatch<React.SetStateAction<{ id: number; name: string }[]>>,
  setSelectedSiteGroup: (group: string) => void
) => {
  useEffect(() => {
    if (activeTab === "add") {
      fetch("https://app.agrinet.us/api/add-unit/user-site-groups?userId=")
        .then((response) => {
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            return response.json()
          } else {
            return response.text().then((text) => text)
          }
        })
        .then((data) => {
          if (data && Array.isArray(data) && data.length > 0) {
            const formattedGroups = data.map((group, index) => ({
              id: index + 1,
              name: group,
            }))

            setSiteGroups(formattedGroups)

            if (formattedGroups.length > 0) {
              setSelectedSiteGroup(formattedGroups[0].name)
            }
          } else {
            setSiteGroups([])
          }
        })
        .catch((error) => {
          console.error("Error fetching user site groups:", error)
          setSiteGroups([])
        })
    }
  }, [activeTab, setSiteGroups, setSelectedSiteGroup])
}