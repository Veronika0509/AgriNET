import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Site, SensorData, ChartPageType, UserId, SiteId } from '../types'
import { getSiteList } from '../pages/Map/data/getSiteList'

/**
 * AppContext - Global application state
 *
 * This context replaces prop drilling from App.tsx and provides
 * global access to main application data
 */

// Navigation history entry
export interface NavigationHistoryEntry {
  path: string
  page: number
  timestamp: number
}

// Application state interface
export interface AppState {
  // Page navigation
  page: number
  mapPageKey: number
  budgetEditorReturnPage: 'chart' | 'menu' | null
  budgetEditorNavigationStack: string[]
  navigationHistory: NavigationHistoryEntry[]

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
  setBudgetEditorReturnPage: (page: 'chart' | 'menu' | null) => void
  setBudgetEditorNavigationStack: (stack: string[]) => void
  pushToBudgetEditorNavigationStack: (page: string) => void
  popFromBudgetEditorNavigationStack: () => string | undefined
  pushToNavigationHistory: (path: string, page: number) => void
  popFromNavigationHistory: () => NavigationHistoryEntry | undefined
  clearNavigationHistory: () => void

  // User data
  setUserId: (userId: UserId) => void
  logout: () => void

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
  const [budgetEditorReturnPage, setBudgetEditorReturnPage] = useState<'chart' | 'menu' | null>(null)
  const [budgetEditorNavigationStack, setBudgetEditorNavigationStack] = useState<string[]>([])
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistoryEntry[]>([])

  // Helper functions for navigation stack
  const pushToBudgetEditorNavigationStack = useCallback((page: string) => {
    setBudgetEditorNavigationStack(prev => [...prev, page])
  }, [])

  const popFromBudgetEditorNavigationStack = useCallback(() => {
    let poppedPage: string | undefined
    setBudgetEditorNavigationStack(prev => {
      const newStack = [...prev]
      poppedPage = newStack.pop()
      return newStack
    })
    return poppedPage
  }, [])

  // Navigation history helper functions
  const pushToNavigationHistory = useCallback((path: string, page: number) => {
    setNavigationHistory(prev => [...prev, { path, page, timestamp: Date.now() }])
  }, [])

  const popFromNavigationHistory = useCallback(() => {
    let poppedEntry: NavigationHistoryEntry | undefined
    setNavigationHistory(prev => {
      const newHistory = [...prev]
      poppedEntry = newHistory.pop()
      return newHistory
    })
    return poppedEntry
  }, [])

  const clearNavigationHistory = useCallback(() => {
    setNavigationHistory([])
  }, [])

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

  // Function to logout and clear session
  const logout = useCallback(() => {
    console.log('[LOGOUT] Starting logout process');
    console.log('[LOGOUT] Current state before logout:', {
      userId,
      page,
      siteListLength: siteList.length,
      siteId,
      mapPageKey,
      chartPageType,
      navigationHistoryLength: navigationHistory.length,
      budgetEditorNavigationStackLength: budgetEditorNavigationStack.length
    });

    // Clear localStorage
    console.log('[LOGOUT] Clearing localStorage items');
    localStorage.removeItem('userId')
    localStorage.removeItem('userData')
    localStorage.removeItem('userRole')

    // Reset state
    console.log('[LOGOUT] Resetting application state');
    setUserId(0 as UserId)
    setSiteList([])
    setSiteId('' as SiteId)
    setSiteName('')
    setChartData([])
    setAdditionalChartData([])
    setSelectedSiteForAddUnit('')
    setSelectedMoistureSensor(null)
    setPage(0)
    setMapPageKey(0)
    setBudgetEditorReturnPage(null)
    setBudgetEditorNavigationStack([])
    clearNavigationHistory()

    console.log('[LOGOUT] Logout process completed');
  }, [userId, page, siteList, siteId, mapPageKey, chartPageType, navigationHistory, budgetEditorNavigationStack, clearNavigationHistory])

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
    budgetEditorReturnPage,
    budgetEditorNavigationStack,
    navigationHistory,

    // Actions
    setPage,
    setUserId,
    logout,
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
    setBudgetEditorReturnPage,
    setBudgetEditorNavigationStack,
    pushToBudgetEditorNavigationStack,
    popFromBudgetEditorNavigationStack,
    pushToNavigationHistory,
    popFromNavigationHistory,
    clearNavigationHistory,
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