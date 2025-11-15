import { useEffect } from "react"
import type { Coordinate } from "../types"

interface UseMapVisibilityProps {
  map: google.maps.Map | null
  mapRef: React.RefObject<HTMLDivElement>
  activeTab: string
  coordinatesForFitting: Coordinate[]
}

/**
 * Custom hook for managing map visibility based on active tab
 * Hides/shows map DOM elements and triggers resize events
 */
export const useMapVisibility = ({ map, mapRef, activeTab, coordinatesForFitting }: UseMapVisibilityProps) => {
  // Toggle map visibility based on active tab
  useEffect(() => {
    if (!map) return

    const mapDivs = document.querySelectorAll(".gm-style")

    if (activeTab !== "map") {
      // Hide map when not on map tab
      mapDivs.forEach((div) => {
        ;(div as HTMLElement).style.visibility = "hidden"
      })
    } else {
      // Show map when on map tab
      mapDivs.forEach((div) => {
        ;(div as HTMLElement).style.visibility = "visible"
      })
      google.maps.event.trigger(map, "resize")
    }
  }, [activeTab, map])

  // Fix map display after returning to map tab
  useEffect(() => {
    if (activeTab !== "map" || !map || !mapRef.current) return

    // Force Google Maps to resize and redraw
    const timeout = setTimeout(() => {
      if (map && mapRef.current) {
        google.maps.event.trigger(map, "resize")

        // Optionally recenter the map if needed
        if (coordinatesForFitting.length > 0) {
          const bounds = new google.maps.LatLngBounds()
          coordinatesForFitting.forEach((coord) => {
            bounds.extend(new google.maps.LatLng(coord.lat, coord.lng))
          })
          map.fitBounds(bounds)
        }
      }
    }, 100) // Small delay to ensure DOM is ready

    return () => clearTimeout(timeout)
  }, [activeTab, map, mapRef, coordinatesForFitting])

  return {
    // This hook primarily manages side effects, no state to return
  }
}