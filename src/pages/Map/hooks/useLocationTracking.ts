import { useState, useCallback, useEffect } from "react"
import React from "react"

export interface UseLocationTrackingReturn {
  userLocation: { lat: number; lng: number } | null
  userLocationMarker: google.maps.Marker | null
  isLocationEnabled: boolean
  locationError: string | null
  getCurrentLocation: () => void
  centerMapOnUserLocation: () => void
  updateUserLocationMarker: (location: { lat: number; lng: number }) => void
  setUserLocationMarker: React.Dispatch<React.SetStateAction<google.maps.Marker | null>>
}

/**
 * Custom hook for managing user GPS location tracking
 */
export const useLocationTracking = (
  map: google.maps.Map | null,
  activeTab: string,
): UseLocationTrackingReturn => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [userLocationMarker, setUserLocationMarker] = useState<google.maps.Marker | null>(null)
  const [isLocationEnabled, setIsLocationEnabled] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const updateUserLocationMarker = useCallback(
    (location: { lat: number; lng: number }) => {
      if (!map) return

      // Remove existing marker if it exists
      if (userLocationMarker) {
        userLocationMarker.setMap(null)
      }

      // Create new marker for user location
      const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: "Your Location",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        zIndex: 1000,
      })

      setUserLocationMarker(marker)
    },
    [map, userLocationMarker],
  )

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      React.startTransition(() => {
        setLocationError("Geolocation is not supported by this browser.")
      })
      return
    }

    React.startTransition(() => {
      setLocationError(null)
    })

    // Try with high accuracy first, then fallback to low accuracy
    const tryHighAccuracy = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const newLocation = { lat: latitude, lng: longitude }

          // Use React.startTransition for safe state updates
          React.startTransition(() => {
            setUserLocation(newLocation)
            setIsLocationEnabled(true)
          })

          // Update marker after state is set
          requestAnimationFrame(() => {
            if (map) {
              updateUserLocationMarker(newLocation)
            }
          })
        },
        () => {
          // Fallback to low accuracy
          tryLowAccuracy()
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // 1 minute
        },
      )
    }

    const tryLowAccuracy = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const newLocation = { lat: latitude, lng: longitude }

          // Use React.startTransition for safe state updates
          React.startTransition(() => {
            setUserLocation(newLocation)
            setIsLocationEnabled(true)
          })

          // Update marker after state is set
          requestAnimationFrame(() => {
            if (map) {
              updateUserLocationMarker(newLocation)
            }
          })
        },
        (error) => {
          let errorMessage = "Unable to retrieve your location."
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please enable location permissions."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable."
              break
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again."
              break
          }

          // Use React.startTransition for safe state updates
          React.startTransition(() => {
            setLocationError(errorMessage)
            setIsLocationEnabled(false)
          })
        },
        {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 300000, // 5 minutes
        },
      )
    }

    // Start with high accuracy attempt
    tryHighAccuracy()
  }, [map, updateUserLocationMarker])

  const centerMapOnUserLocation = useCallback(() => {
    if (userLocation && map) {
      requestAnimationFrame(() => {
        map.setCenter(userLocation)
        map.setZoom(16)
      })
    } else {
      // Try to get location if not available
      getCurrentLocation()
    }
  }, [userLocation, map, getCurrentLocation])

  // Initialize location on map load - ONLY ON MOBILE DEVICES
  useEffect(() => {
    // Check if device is mobile before initializing GPS
    const userAgent = navigator.userAgent
    const screenWidth = window.screen?.width || window.innerWidth
    const isMobileUserAgent =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|IEMobile|Opera Mini|Mobile|Tablet/i.test(userAgent)
    const isDesktop = /Windows NT|Macintosh|Linux/i.test(userAgent) && screenWidth > 1024
    const shouldInitializeLocation = isMobileUserAgent && !isDesktop

    // Initialize GPS ONLY on mobile devices when map is loaded
    if (map && activeTab === "map" && shouldInitializeLocation) {
      // Small delay to ensure map is fully rendered
      const timer = setTimeout(() => {
        getCurrentLocation()
      }, 1000)

      return () => clearTimeout(timer)
    }
    return () => {}
  }, [map, activeTab, getCurrentLocation])

  return {
    userLocation,
    userLocationMarker,
    isLocationEnabled,
    locationError,
    getCurrentLocation,
    centerMapOnUserLocation,
    updateUserLocationMarker,
    setUserLocationMarker,
  }
}