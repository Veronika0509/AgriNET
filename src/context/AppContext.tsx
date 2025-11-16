import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Site, SensorData, ChartPageType, UserId, SiteId } from '../types'
import { getSiteList } from '../pages/Map/data/getSiteList'

/**
 * AppContext - Глобальное состояние приложения
 *
 * Этот контекст заменяет prop drilling из App.tsx и предоставляет
 * глобальный доступ к основным данным приложения
 */

// Интерфейс состояния приложения
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

// Интерфейс для функций изменения состояния
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

// Полный контекст с состоянием и действиями
export interface AppContextType extends AppState, AppActions {}

// Создаем контекст с undefined по умолчанию (будет установлен в Provider)
const AppContext = createContext<AppContextType | undefined>(undefined)

// Props для Provider компонента
interface AppProviderProps {
  children: ReactNode
}

/**
 * AppProvider - Provider компонент для глобального состояния
 *
 * Оборачивает все приложение и предоставляет доступ к состоянию
 * через useAppContext hook
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Инициализация всего состояния из App.tsx
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

  // Функция для перезагрузки списка сайтов
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

  // Собираем все значения в один объект контекста
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
 * useAppContext - Hook для доступа к глобальному состоянию
 *
 * Использование:
 * const { userId, setUserId, siteList, setSiteList } = useAppContext()
 *
 * @throws Error если используется вне AppProvider
 */
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext)

  if (context === undefined) {
    throw new Error('useAppContext must be used within AppProvider')
  }

  return context
}

// Экспортируем контекст для продвинутого использования (если нужно)
export default AppContext