/**
 * Custom hook for managing modal states
 * Extracted from Map/index.tsx (lines 321, 339, 363)
 */

import { useState, useCallback } from "react"

export interface UseModalManagementReturn {
  // New Layer Modal
  isNewLayerModalOpen: boolean
  setIsNewLayerModalOpen: (open: boolean) => void
  openNewLayerModal: () => void
  closeNewLayerModal: () => void

  // Sensor Modal
  isSensorModalOpen: boolean
  setIsSensorModalOpen: (open: boolean) => void
  openSensorModal: () => void
  closeSensorModal: () => void

  // Timezone Modal
  isTimezoneModalOpen: boolean
  setIsTimezoneModalOpen: (open: boolean) => void
  openTimezoneModal: () => void
  closeTimezoneModal: () => void
}

export const useModalManagement = (): UseModalManagementReturn => {
  // New Layer Modal state
  const [isNewLayerModalOpen, setIsNewLayerModalOpen] = useState<boolean>(false)

  // Sensor Modal state
  const [isSensorModalOpen, setIsSensorModalOpen] = useState<boolean>(false)

  // Timezone Modal state
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState<boolean>(false)

  // New Layer Modal handlers
  const openNewLayerModal = useCallback(() => {
    setIsNewLayerModalOpen(true)
  }, [])

  const closeNewLayerModal = useCallback(() => {
    setIsNewLayerModalOpen(false)
  }, [])

  // Sensor Modal handlers
  const openSensorModal = useCallback(() => {
    setIsSensorModalOpen(true)
  }, [])

  const closeSensorModal = useCallback(() => {
    setIsSensorModalOpen(false)
  }, [])

  // Timezone Modal handlers
  const openTimezoneModal = useCallback(() => {
    setIsTimezoneModalOpen(true)
  }, [])

  const closeTimezoneModal = useCallback(() => {
    setIsTimezoneModalOpen(false)
  }, [])

  return {
    // New Layer Modal
    isNewLayerModalOpen,
    setIsNewLayerModalOpen,
    openNewLayerModal,
    closeNewLayerModal,

    // Sensor Modal
    isSensorModalOpen,
    setIsSensorModalOpen,
    openSensorModal,
    closeSensorModal,

    // Timezone Modal
    isTimezoneModalOpen,
    setIsTimezoneModalOpen,
    openTimezoneModal,
    closeTimezoneModal,
  }
}