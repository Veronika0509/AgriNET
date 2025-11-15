import { useState, useEffect } from "react"
import type { Coordinate } from "../types"
import type { OverlayItem } from "../types/OverlayItem"

interface UseMapBoundsProps {
  map: google.maps.Map | null
  activeOverlays: OverlayItem[]
  amountOfSensors: number
  coordinatesForFitting: Coordinate[]
}

/**
 * Custom hook for managing map bounds fitting logic
 * Handles automatic zoom and bounds fitting when overlays are loaded
 */
export const useMapBounds = ({ map, activeOverlays, amountOfSensors, coordinatesForFitting }: UseMapBoundsProps) => {
  const [areBoundsFitted, setAreBoundsFitted] = useState(false)
  const [initialZoom, setInitialZoom] = useState(0)

  /**
   * Calculate optimal zoom level for given bounds
   */
  const calculateZoomLevel = (bounds: google.maps.LatLngBounds, mapDim: { height: number; width: number }) => {
    const WORLD_DIM = { height: 256, width: 256 }
    const ZOOM_MAX = 21

    function latRad(lat: number) {
      const sin = Math.sin((lat * Math.PI) / 180)
      const radX2 = Math.log((1 + sin) / (1 - sin)) / 2
      return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2
    }

    function zoom(mapPx: number, worldPx: number, fraction: number) {
      return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2)
    }

    const ne = bounds.getNorthEast()
    const sw = bounds.getSouthWest()

    const latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI

    const lngDiff = ne.lng() - sw.lng()
    const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360

    const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction)
    const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction)

    return Math.min(latZoom, lngZoom, ZOOM_MAX)
  }

  /**
   * Fit map bounds to show all overlays
   */
  const fitMapBounds = () => {
    if (!map || activeOverlays.length === 0 || coordinatesForFitting.length === 0) {
      return
    }

    const bounds = new google.maps.LatLngBounds()
    coordinatesForFitting.forEach((coordinate: Coordinate) => {
      bounds.extend({ lat: coordinate.lat, lng: coordinate.lng })
    })

    const mapDiv = map.getDiv()
    const mapDim = {
      height: mapDiv.offsetHeight - 100,
      width: mapDiv.offsetWidth - 100,
    }
    const calculatedZoom = calculateZoomLevel(bounds, mapDim)
    map.setZoom(calculatedZoom)

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (map) {
          google.maps.event.trigger(map, "resize")
          map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 })
          setAreBoundsFitted(true)
        }
      }, 100)
    })
  }

  /**
   * Reset bounds fitted state
   */
  const resetBoundsFitted = () => {
    setAreBoundsFitted(false)
  }

  // Automatically fit bounds when all overlays are loaded
  useEffect(() => {
    if (activeOverlays.length !== 0 && activeOverlays.length === amountOfSensors && !areBoundsFitted) {
      fitMapBounds()
    }
  }, [activeOverlays, amountOfSensors, areBoundsFitted])

  return {
    areBoundsFitted,
    setAreBoundsFitted,
    initialZoom,
    setInitialZoom,
    calculateZoomLevel,
    fitMapBounds,
    resetBoundsFitted,
  }
}