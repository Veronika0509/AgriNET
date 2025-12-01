import { useState, useCallback, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';

export const useUserLocation = (map?: google.maps.Map | null) => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [userLocationMarker, setUserLocationMarker] = useState<google.maps.Marker | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async (map: google.maps.Map | null) => {
    if (!map) return;

    try {
      setLocationError(null);

      // Check and request permissions using Capacitor
      const permission = await Geolocation.checkPermissions();

      if (permission.location === 'denied') {
        const requestResult = await Geolocation.requestPermissions();
        if (requestResult.location === 'denied') {
          setLocationError('Location permission denied');
          return;
        }
      }

      // Get current position using Capacitor
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      setUserLocation(newLocation);
      setIsLocationEnabled(true);

      // Update or create marker
      if (userLocationMarker) {
        userLocationMarker.setPosition(newLocation);
      } else {
        const marker = new google.maps.Marker({
          position: newLocation,
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          },
          title: 'Your Location'
        });
        setUserLocationMarker(marker);
      }
    } catch (error: any) {
      const errorMessage = `Location error: ${error.message || 'Unknown error'}`;
      setLocationError(errorMessage);
      console.error('Geolocation error:', error);
    }
  }, [userLocationMarker]);

  const centerOnUserLocation = useCallback((map: google.maps.Map | null) => {
    if (map && userLocation) {
      map.setCenter(userLocation);
      map.setZoom(16);
    }
  }, [userLocation]);

  const toggleLocationTracking = useCallback((map: google.maps.Map | null) => {
    if (isLocationEnabled) {
      // Disable location
      if (userLocationMarker) {
        userLocationMarker.setMap(null);
        setUserLocationMarker(null);
      }
      setUserLocation(null);
      setIsLocationEnabled(false);
      setLocationError(null);
    } else {
      // Enable location
      getCurrentLocation(map);
    }
  }, [isLocationEnabled, userLocationMarker, getCurrentLocation]);

  // Automatically get user location when map is available (only on mobile/tablet devices)
  useEffect(() => {
    // Check if this is a mobile or tablet device
    const userAgent = navigator.userAgent;
    const screenWidth = window.screen?.width || window.innerWidth;
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|IEMobile|Opera Mini|Mobile|Tablet/i.test(userAgent);
    const isDesktop = /Windows NT|Macintosh|Linux/i.test(userAgent) && screenWidth > 1024;
    const shouldEnableLocation = isMobileUserAgent && !isDesktop;

    if (map && !userLocation && !isLocationEnabled && !locationError && shouldEnableLocation) {
      // Call async function properly
      getCurrentLocation(map).catch(error => {
        console.error('Failed to get location on mount:', error);
      });
    }
  }, [map, userLocation, isLocationEnabled, locationError, getCurrentLocation]);

  return {
    userLocation,
    userLocationMarker,
    isLocationEnabled,
    locationError,
    getCurrentLocation,
    centerOnUserLocation,
    toggleLocationTracking
  };
};
