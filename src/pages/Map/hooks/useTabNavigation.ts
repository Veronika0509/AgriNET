/**
 * Custom hook for managing tab navigation state
 * Extracted from Map/index.tsx (lines 250-251)
 */

import { useState } from "react"

export type TabType = "map" | "add" | "qr" | "comments" | "budget" | "info"

export interface UseTabNavigationReturn {
  activeTab: TabType | string
  setActiveTab: (tab: TabType | string) => void
  navigationHistory: string[]
  setNavigationHistory: React.Dispatch<React.SetStateAction<string[]>>
  navigateToTab: (tab: TabType | string) => void
  navigateBack: () => void
  canNavigateBack: boolean
}

export const useTabNavigation = (initialTab: TabType | string = "map"): UseTabNavigationReturn => {
  const [activeTab, setActiveTab] = useState<TabType | string>(initialTab)
  const [navigationHistory, setNavigationHistory] = useState<string[]>([initialTab])

  const navigateToTab = (tab: TabType | string) => {
    setActiveTab(tab)
    setNavigationHistory((prev) => [...prev, tab])
  }

  const navigateBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory]
      newHistory.pop()
      const previousTab = newHistory[newHistory.length - 1]
      setNavigationHistory(newHistory)
      setActiveTab(previousTab)
    }
  }

  const canNavigateBack = navigationHistory.length > 1

  return {
    activeTab,
    setActiveTab,
    navigationHistory,
    setNavigationHistory,
    navigateToTab,
    navigateBack,
    canNavigateBack,
  }
}