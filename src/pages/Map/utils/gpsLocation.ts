import React from "react"

export interface LocationState {
  userLocation: { lat: number; lng: number } | null
  setUserLocation: React.Dispatch<React.SetStateAction<{ lat: number; lng: number } | null>>
  setIsLocationEnabled: React.Dispatch<React.SetStateAction<boolean>>
  setLocationError: React.Dispatch<React.SetStateAction<string | null>>
  userLocationMarker: google.maps.Marker | null
  setUserLocationMarker: React.Dispatch<React.SetStateAction<google.maps.Marker | null>>
}

/**
 * Updates or creates a user location marker on the map
 * @param map - Google Maps instance
 * @param location - User's current location
 * @param state - Location state object
 */
export const updateUserLocationMarker = (
  map: google.maps.Map,
  location: { lat: number; lng: number },
  state: LocationState
) => {
  if (!map) return

  // Remove existing marker if it exists
  if (state.userLocationMarker) {
    state.userLocationMarker.setMap(null)
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

  state.setUserLocationMarker(marker)
}

/**
 * Tries to get user's location with high accuracy
 * @param state - Location state object
 * @param map - Google Maps instance
 * @param onFallback - Callback to try low accuracy if high accuracy fails
 */
export const tryHighAccuracyLocation = (
  state: LocationState,
  map: google.maps.Map | null,
  onFallback: () => void
) => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      const newLocation = { lat: latitude, lng: longitude }

      // Use React.startTransition for safe state updates
      React.startTransition(() => {
        state.setUserLocation(newLocation)
        state.setIsLocationEnabled(true)
      })

      // Update marker after state is set
      requestAnimationFrame(() => {
        if (map) {
          updateUserLocationMarker(map, newLocation, state)
        }
      })
    },
    () => {
      // Fallback to low accuracy if high accuracy fails
      onFallback()
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute
    }
  )
}

/**
 * Tries to get user's location with low accuracy
 * @param state - Location state object
 * @param map - Google Maps instance
 */
export const tryLowAccuracyLocation = (state: LocationState, map: google.maps.Map | null) => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      const newLocation = { lat: latitude, lng: longitude }

      // Use React.startTransition for safe state updates
      React.startTransition(() => {
        state.setUserLocation(newLocation)
        state.setIsLocationEnabled(true)
      })

      // Update marker after state is set
      requestAnimationFrame(() => {
        if (map) {
          updateUserLocationMarker(map, newLocation, state)
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
        state.setLocationError(errorMessage)
        state.setIsLocationEnabled(false)
      })
    },
    {
      enableHighAccuracy: false,
      timeout: 20000,
      maximumAge: 300000, // 5 minutes
    }
  )
}

/**
 * Centers the map on user's current location
 * @param userLocation - User's current location
 * @param map - Google Maps instance
 * @param getCurrentLocation - Function to get location if not available
 */
export const centerMapOnUserLocation = (
  userLocation: { lat: number; lng: number } | null,
  map: google.maps.Map | null,
  getCurrentLocation: () => void
) => {
  if (userLocation && map) {
    requestAnimationFrame(() => {
      map.setCenter(userLocation)
      map.setZoom(14)
    })
  } else {
    // Try to get location if not available
    getCurrentLocation()
  }
}

/**
 * Checks if the device is mobile
 * @returns True if device is mobile, false otherwise
 */
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent
  const screenWidth = window.screen?.width || window.innerWidth
  const isMobileUserAgent =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|IEMobile|Opera Mini|Mobile|Tablet/i.test(userAgent)
  const isDesktop = /Windows NT|Macintosh|Linux/i.test(userAgent) && screenWidth > 1024
  return isMobileUserAgent && !isDesktop
}
