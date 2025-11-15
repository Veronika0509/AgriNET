import { useEffect } from "react"
import { CollisionResolver } from "../components/CollisionResolver"
import type { OverlayItem } from "../types/OverlayItem"

interface UseCollisionResolutionProps {
  map: google.maps.Map | null
  activeOverlays: OverlayItem[]
  areBoundsFitted: boolean
}

/**
 * Custom hook for managing overlay collision resolution
 * Handles resolving overlapping chart overlays on the map
 */
export const useCollisionResolution = ({ map, activeOverlays, areBoundsFitted }: UseCollisionResolutionProps) => {
  // Resolve collisions when overlays are active
  useEffect(() => {
    if (activeOverlays.length !== 0) {
      CollisionResolver.resolve(activeOverlays)
    }
  }, [activeOverlays])

  // Handle collisions on resize and zoom events after bounds are fitted
  useEffect(() => {
    if (!map || activeOverlays.length === 0 || !areBoundsFitted) {
      return
    }

    const handleResize = () => {
      new Promise<void>((resolve) => {
        // Reset overlay offsets
        activeOverlays.forEach((overlay: OverlayItem) => {
          overlay.offset = { x: 0, y: 0 }
        })
        resolve()
      }).then(() => {
        CollisionResolver.resolve(activeOverlays)
      })
    }

    // Add event listeners
    window.addEventListener("resize", handleResize)
    const zoomListener = map.addListener("zoom_changed", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      if (zoomListener) {
        google.maps.event.removeListener(zoomListener)
      }
    }
  }, [map, activeOverlays, areBoundsFitted])

  return {
    // This hook primarily manages side effects, no state to return
  }
}