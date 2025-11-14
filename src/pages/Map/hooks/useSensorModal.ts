import { useState, useCallback } from "react"

/**
 * Custom hook for managing sensor modal state and interactions
 * Handles sensor selection and modal open/close operations
 */
export const useSensorModal = (
  setPage: (page: number) => void,
  setSelectedMoistureSensor?: (sensor: any) => void
) => {
  const [selectedSensor, setSelectedSensor] = useState<any>(null)
  const [availableSensors, setAvailableSensors] = useState<any[]>([])

  const handleSensorSelect = useCallback(
    (sensor: any) => {
      setSelectedSensor(sensor)

      // Save selected sensor in global state and navigate to VirtualValve page
      setSelectedMoistureSensor?.(sensor)
      setPage(3)
    },
    [setPage, setSelectedMoistureSensor]
  )

  return {
    selectedSensor,
    setSelectedSensor,
    availableSensors,
    setAvailableSensors,
    handleSensorSelect,
  }
}