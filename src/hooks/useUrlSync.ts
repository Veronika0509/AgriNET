import { useEffect, useRef } from 'react'
import { pageToUrl, parseCurrentUrl, pathToPage, isDeepLink } from '../utils/url'
import { fetchChartDataForDeepLink } from '../functions/fetchChartDataForDeepLink'
import type { ChartPageType, UserId, SiteId, SensorData, Site } from '../types'
import { createSiteId, createUserId } from '../types'

interface UrlSyncState {
  page: number
  siteId: SiteId
  chartPageType: ChartPageType
  userId: UserId
}

interface UrlSyncSetters {
  setPage: (page: number) => void
  setSiteId: (id: SiteId) => void
  setSiteName: (name: string) => void
  setChartData: (data: SensorData[]) => void
  setAdditionalChartData: (data: any) => void
  setChartPageType: (type: ChartPageType) => void
  setSiteList: (sites: Site[]) => void
  setUserId: (id: UserId) => void
}

interface UrlSyncResult {
  restoreFromUrl: () => Promise<boolean>
}

export function useUrlSync(state: UrlSyncState, setters: UrlSyncSetters): UrlSyncResult {
  const { page, siteId, chartPageType, userId } = state
  const skipNextSyncRef = useRef(false)

  // State → URL sync: update browser URL when page changes (pages 1-7 only)
  // Page 0 is handled by React Router — back handlers must use history.replace()
  useEffect(() => {
    if (page === 0) return

    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false
      return
    }

    const url = pageToUrl(page, { siteId, chartPageType })
    if (url) {
      window.history.replaceState({ appPage: page }, '', url)
    }
  }, [page, siteId, chartPageType])

  // URL → State restoration (called from init effect)
  const restoreFromUrl = async (): Promise<boolean> => {
    const { path, params } = parseCurrentUrl()

    if (!isDeepLink(path)) return false

    const targetPage = pathToPage(path)
    if (targetPage === undefined) return false

    // Page 0 routes (info, budget) - React Router handles them
    if (targetPage === 0) return false

    // Simple pages without extra state
    if (targetPage === 1 || targetPage === 5 || targetPage === 6 || targetPage === 7) {
      skipNextSyncRef.current = true
      setters.setPage(targetPage)
      return true
    }

    // Chart page - needs data fetching
    if (targetPage === 2) {
      const deepLinkSiteId = params.get('siteId')
      const deepLinkType = params.get('type') as ChartPageType | undefined

      if (!deepLinkSiteId || !deepLinkType) return false

      // Get userId from localStorage if not yet set
      let effectiveUserId = userId
      if (Number(effectiveUserId) === 0) {
        const storedUserId = localStorage.getItem('userId')
        if (storedUserId) {
          effectiveUserId = createUserId(parseInt(storedUserId))
        } else {
          return false
        }
      }

      const success = await fetchChartDataForDeepLink(
        deepLinkSiteId,
        deepLinkType,
        effectiveUserId,
        {
          setChartData: setters.setChartData,
          setAdditionalChartData: setters.setAdditionalChartData,
          setSiteId: setters.setSiteId,
          setSiteName: setters.setSiteName,
          setChartPageType: setters.setChartPageType,
          setSiteList: setters.setSiteList,
        }
      )

      if (success) {
        skipNextSyncRef.current = true
        setters.setPage(2)
        return true
      }
      return false
    }

    // Virtual valve / Add valve pages - need siteId from URL
    if (targetPage === 3 || targetPage === 4) {
      const deepLinkSiteId = params.get('siteId')
      if (deepLinkSiteId) {
        setters.setSiteId(createSiteId(deepLinkSiteId))
      }
      skipNextSyncRef.current = true
      setters.setPage(targetPage)
      return true
    }

    return false
  }

  return { restoreFromUrl }
}
