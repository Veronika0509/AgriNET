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
export const useMapVisibility = ({ map, mapRef, activeTab }: UseMapVisibilityProps) => {
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
  useEffect((): void | (() => void) => {
    if (activeTab !== "map" || !map || !mapRef.current) return

    // Force Google Maps to resize and redraw
    const timeout = setTimeout(() => {
      if (map && mapRef.current) {
        google.maps.event.trigger(map, "resize")

        // Don't recenter here - let createSites handle centering properly
        // coordinatesForFitting may contain sensor coordinates which would cause
        // incorrect centering when returning from sensor view
      }
    }, 100) // Small delay to ensure DOM is ready

    return (): void => {
      clearTimeout(timeout)
    }
  }, [activeTab, map, mapRef])

  return {
    // This hook primarily manages side effects, no state to return
  }
}