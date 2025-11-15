import { useEffect, useRef } from "react"
import type { OverlayItem } from "../types/OverlayItem"
import type { ExtlDataContainerItem } from "../types"

interface UseMarkerClickCleanupProps {
  isMarkerClicked: boolean | string
  activeOverlays: OverlayItem[]
  markers: google.maps.Marker[]
  moistOverlaysRef: React.MutableRefObject<any[]>
  setMoistOverlays: React.Dispatch<React.SetStateAction<OverlayItem[]>>
  setTempOverlays: React.Dispatch<React.SetStateAction<OverlayItem[]>>
  setValveOverlays: React.Dispatch<React.SetStateAction<OverlayItem[]>>
  setFuelOverlays: React.Dispatch<React.SetStateAction<OverlayItem[]>>
  setActiveOverlays: React.Dispatch<React.SetStateAction<OverlayItem[]>>
  setAllOverlays: React.Dispatch<React.SetStateAction<OverlayItem[]>>
  setMoistChartDataContainer: React.Dispatch<React.SetStateAction<any[]>>
  setInvalidMoistChartDataContainer: React.Dispatch<React.SetStateAction<any[]>>
  setTempChartDataContainer: React.Dispatch<React.SetStateAction<any[]>>
  setInvalidTempChartDataContainer: React.Dispatch<React.SetStateAction<any[]>>
  setValveChartDataContainer: React.Dispatch<React.SetStateAction<any[]>>
  setInvalidValveChartDataContainer: React.Dispatch<React.SetStateAction<any[]>>
  setWxetDataContainer: React.Dispatch<React.SetStateAction<any[]>>
  setInvalidWxetDataContainer: React.Dispatch<React.SetStateAction<any[]>>
  setExtlDataContainer: React.Dispatch<React.SetStateAction<ExtlDataContainerItem[]>>
  setCoordinatesForFitting: React.Dispatch<React.SetStateAction<Array<{ lat: number; lng: number }>>>
  setAllCoordinatesOfMarkers: React.Dispatch<React.SetStateAction<Array<{ lat: number; lng: number }>>>
  setAmountOfSensors: React.Dispatch<React.SetStateAction<number>>
  setAreBoundsFitted: React.Dispatch<React.SetStateAction<boolean>>
  setMarkers: React.Dispatch<React.SetStateAction<google.maps.Marker[]>>
  setInitialZoom: React.Dispatch<React.SetStateAction<number | undefined>>
}

/**
 * Custom hook for cleaning up overlays and data when transitioning from sensor view to site view
 * Handles removal of all overlays, clearing data containers, and resetting markers
 */
export const useMarkerClickCleanup = (props: UseMarkerClickCleanupProps) => {
  const prevIsMarkerClickedRef = useRef<boolean | string | null>(null)

  useEffect(() => {
    // Skip on first mount (prevIsMarkerClickedRef.current === null)
    if (prevIsMarkerClickedRef.current === null) {
      prevIsMarkerClickedRef.current = props.isMarkerClicked
      return
    }

    // Only cleanup when transitioning from sensor view (was truthy) to site view (now false)
    const wasInSensorView = prevIsMarkerClickedRef.current !== false
    const isNowInSiteView = props.isMarkerClicked === false

    if (wasInSensorView && isNowInSiteView) {
      // Remove all overlays from the map using activeOverlays which contains all the overlay instances
      props.activeOverlays.forEach((overlay: OverlayItem) => {
        if (overlay && overlay.setMap && typeof overlay.setMap === "function") {
          try {
            overlay.setMap(null)
          } catch (error) {
            console.warn("Error removing overlay from map:", error)
          }
        }
      })

      // Clear all overlay state arrays
      props.setMoistOverlays([])
      props.setTempOverlays([])
      props.setValveOverlays([])
      props.setFuelOverlays([])
      props.setActiveOverlays([])
      props.setAllOverlays([])

      // Clear all data containers
      props.setMoistChartDataContainer([])
      props.setInvalidMoistChartDataContainer([])
      props.setTempChartDataContainer([])
      props.setInvalidTempChartDataContainer([])
      props.setValveChartDataContainer([])
      props.setInvalidValveChartDataContainer([])
      props.setWxetDataContainer([])
      props.setInvalidWxetDataContainer([])
      props.setExtlDataContainer([])

      // Reset other related state
      props.setCoordinatesForFitting([])
      props.setAllCoordinatesOfMarkers([])
      props.setAmountOfSensors(0)
      props.setAreBoundsFitted(false)

      // Clear moistOverlaysRef
      props.moistOverlaysRef.current = []

      // Clear site markers so createSites will recreate them
      // IMPORTANT: Remove old site markers from the map BEFORE clearing the state
      props.markers.forEach((marker: any) => {
        if (marker && marker.setMap) {
          marker.setMap(null)
        }
        if (marker && marker.infoWindow) {
          marker.infoWindow.close()
        }
      })
      props.setMarkers([])

      // Reset initialZoom so that createSites recalculates the proper zoom/center for all sites
      // This ensures the map fits all sites properly when returning from sensor view
      props.setInitialZoom(undefined)
    }

    // Update the ref to track the current state for the next render
    prevIsMarkerClickedRef.current = props.isMarkerClicked
  }, [props.isMarkerClicked, props.activeOverlays, props.markers])
}