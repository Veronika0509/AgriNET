import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Site, SensorData, ChartPageType, UserId, SiteId } from '../types'
import { getSiteList } from '../pages/Map/data/getSiteList'

/**
 * AppContext - Global application state
 *
 * This context replaces prop drilling from App.tsx and provides
 * global access to main application data
 */

// Application state interface
export interface AppState {
  // Page navigation
  page: number
  mapPageKey: number

  // User data
  userId: UserId

  // Site data
  siteList: Site[]
  siteId: SiteId
  siteName: string
  selectedSiteForAddUnit: string

  // Chart data
  chartData: SensorData[]
  additionalChartData: SensorData[]
  chartPageType: ChartPageType

  // Google Maps API
  isGoogleApiLoaded: boolean

  // Sensor selection
  selectedMoistureSensor: any | null
}

// Interface for state modification functions
export interface AppActions {
  // Page navigation
  setPage: (page: number) => void
  setMapPageKey: (key: number | ((prev: number) => number)) => void

  // User data
  setUserId: (userId: UserId) => void

  // Site data
  setSiteList: (siteList: Site[]) => void
  setSiteId: (siteId: SiteId) => void
  setSiteName: (siteName: string) => void
  setSelectedSiteForAddUnit: (site: string) => void

  // Chart data
  setChartData: (chartData: SensorData[]) => void
  setAdditionalChartData: (chartData: SensorData[]) => void
  setChartPageType: (chartPageType: ChartPageType) => void

  // Google Maps API
  setGoogleApiLoaded: (loaded: boolean) => void

  // Sensor selection
  setSelectedMoistureSensor: (sensor: any | null) => void

  // Utility functions
  reloadMapPage: () => Promise<void>
}

// Full context with state and actions
export interface AppContextType extends AppState, AppActions {}

// Create context with undefined as default (will be set in Provider)
const AppContext = createContext<AppContextType | undefined>(undefined)

// Props for Provider component
interface AppProviderProps {
  children: ReactNode
}

/**
 * AppProvider - Provider component for global state
 *
 * Wraps the entire application and provides access to state
 * through useAppContext hook
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Initialize all state from App.tsx
  const [page, setPage] = useState<number>(0)
  const [userId, setUserId] = useState<UserId>(0 as UserId)
  const [siteList, setSiteList] = useState<Site[]>([])
  const [siteId, setSiteId] = useState<SiteId>('' as SiteId)
  const [siteName, setSiteName] = useState<string>('')
  const [chartData, setChartData] = useState<SensorData[]>([])
  const [additionalChartData, setAdditionalChartData] = useState<SensorData[]>([])
  const [chartPageType, setChartPageType] = useState<ChartPageType>('moist')
  const [isGoogleApiLoaded, setGoogleApiLoaded] = useState<boolean>(false)
  const [mapPageKey, setMapPageKey] = useState<number>(0)
  const [selectedSiteForAddUnit, setSelectedSiteForAddUnit] = useState<string>('')
  const [selectedMoistureSensor, setSelectedMoistureSensor] = useState<any>(null)

  // Function to reload site list
  const handleReloadMapPage = useCallback(async () => {
    // Fetch fresh site list data
    const sites = await getSiteList(userId)

    // Check if API call was successful
    if ('success' in sites && sites.success === false) {
      console.error('Failed to reload site list:', sites.error)
    } else {
      // Update site list with fresh data
      setSiteList(sites.data)
    }

    // DON'T force remount - just update the site list
    // The map will react to the siteList change via useEffect
  }, [userId])

  // Combine all values into one context object
  const contextValue: AppContextType = {
    // State
    page,
    userId,
    siteList,
    siteId,
    siteName,
    chartData,
    additionalChartData,
    chartPageType,
    isGoogleApiLoaded,
    mapPageKey,
    selectedSiteForAddUnit,
    selectedMoistureSensor,

    // Actions
    setPage,
    setUserId,
    setSiteList,
    setSiteId,
    setSiteName,
    setChartData,
    setAdditionalChartData,
    setChartPageType,
    setGoogleApiLoaded,
    setMapPageKey,
    setSelectedSiteForAddUnit,
    setSelectedMoistureSensor,
    reloadMapPage: handleReloadMapPage,
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

/**
 * useAppContext - Hook for accessing global state
 *
 * Usage:
 * const { userId, setUserId, siteList, setSiteList } = useAppContext()
 *
 * @throws Error if used outside AppProvider
 */
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext)

  if (context === undefined) {
    throw new Error('useAppContext must be used within AppProvider')
  }

  return context
}

// Export context for advanced usage (if needed)
export default AppContext