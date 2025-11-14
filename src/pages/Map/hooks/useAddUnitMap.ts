import { useState, useRef } from "react"

/**
 * Custom hook for managing Add Unit map state
 * Handles the map instance and markers for the Add Unit tab
 */
export const useAddUnitMap = () => {
  const addUnitMapRef = useRef<HTMLDivElement>(null)
  const [addUnitMap, setAddUnitMap] = useState<google.maps.Map | null>(null)
  const [centerMarker, setCenterMarker] = useState<google.maps.Marker | null>(null)
  const [crosshairMarker, setCrosshairMarker] = useState<google.maps.Marker | null>(null)

  return {
    addUnitMapRef,
    addUnitMap,
    setAddUnitMap,
    centerMarker,
    setCenterMarker,
    crosshairMarker,
    setCrosshairMarker,
  }
}