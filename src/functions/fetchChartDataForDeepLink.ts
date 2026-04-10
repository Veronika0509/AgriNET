import type { ChartPageType, UserId, SiteId, SensorData, Site } from '../types'
import { createSiteId } from '../types'
import { getSiteList } from '../pages/Map/data/getSiteList'
import { getMoistMainChartData } from '../pages/Map/data/types/moist/getMoistMainChartData'
import { getTempMainChartData } from '../pages/Map/data/types/temp/getTempMainChartData'
import { getWxetMainChartData } from '../pages/Map/data/types/wxet/getWxetMainChartData'
import { getFuelMainChartData } from '../pages/Map/data/types/wxet/getFuelMainChartData'
import { getValveData } from '../pages/Map/data/types/valve/getValveData'
import { getSensorItems } from '../pages/Map/data/getSensorItems'

interface DeepLinkSetters {
  setChartData: (data: SensorData[]) => void
  setAdditionalChartData: (data: any) => void
  setSiteId: (id: SiteId) => void
  setSiteName: (name: string) => void
  setChartPageType: (type: ChartPageType) => void
  setSiteList: (sites: Site[]) => void
}

// Find sensor name from site list by sensorId
function findSensorName(siteList: any[], sensorId: string): string {
  for (const site of siteList) {
    if (site.layers) {
      for (const layer of site.layers) {
        if (layer.markers) {
          for (const marker of layer.markers) {
            if (marker.sensorId === sensorId) {
              return marker.name || sensorId
            }
          }
        }
      }
    }
  }
  return sensorId
}

// Find mainId (parent sensor) for moist sensors
function findMainId(siteList: any[], sensorId: string): string | undefined {
  for (const site of siteList) {
    if (site.layers) {
      for (const layer of site.layers) {
        if (layer.markers) {
          for (const marker of layer.markers) {
            if (marker.sensorId === sensorId) {
              return marker.id
            }
          }
        }
      }
    }
  }
  return undefined
}

export async function fetchChartDataForDeepLink(
  sensorId: string,
  chartType: ChartPageType,
  userId: UserId,
  setters: DeepLinkSetters
): Promise<boolean> {
  try {
    // Fetch site list to get sensor name
    const siteListResponse = await getSiteList(userId)
    if ('success' in siteListResponse && siteListResponse.success === false) {
      return false
    }

    const sites = siteListResponse.data
    setters.setSiteList(sites)

    const sensorName = findSensorName(sites, sensorId)

    switch (chartType) {
      case 'moist': {
        const chartResponse = await getMoistMainChartData(sensorId, false)
        const mainId = findMainId(sites, sensorId)
        if (mainId) {
          const sensorItems = getSensorItems('moist-fuel', sites as any)
          const sensorItem = sensorItems.find((item: any) => item.id === mainId)
          if (sensorItem) {
            setters.setAdditionalChartData({
              linesCount: (sensorItem as any).sensorCount,
              legend: chartResponse.data.legend,
            })
          }
        }
        setters.setChartData(chartResponse.data.data)
        break
      }

      case 'temp': {
        // getTempMainChartData requires a present function for toast notifications
        const noopPresent = () => {}
        const chartResponse = await getTempMainChartData(noopPresent as any, sensorId, userId)
        if (!chartResponse?.data) return false
        setters.setAdditionalChartData({ metric: chartResponse.data.metric })
        setters.setChartData(chartResponse.data.data)
        break
      }

      case 'wxet': {
        const chartResponse = await getWxetMainChartData(sensorId)
        setters.setChartData(chartResponse.data.data)
        setters.setAdditionalChartData({
          metric: chartResponse.data.metric,
          type: chartResponse.data.type,
        })
        break
      }

      case 'valve': {
        const chartResponse = await getValveData(sensorId, userId)
        setters.setChartData(chartResponse.data)
        break
      }

      case 'fuel': {
        const chartResponse = await getFuelMainChartData(sensorId)
        setters.setChartData(chartResponse.data.data)
        break
      }

      default:
        return false
    }

    setters.setSiteId(createSiteId(sensorId))
    setters.setSiteName(sensorName)
    setters.setChartPageType(chartType)
    return true
  } catch (error) {
    console.error('[DeepLink] Failed to fetch chart data:', error)
    return false
  }
}
