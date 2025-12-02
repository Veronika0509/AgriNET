import { useState, useCallback, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';

export const useUserLocation = (map?: google.maps.Map | null) => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [userLocationMarker, setUserLocationMarker] = useState<google.maps.Marker | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<string | null>(null);

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

      // First try to get an initial position with relaxed settings
      try {
        const initialPosition = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 60000 // Allow cached position up to 1 minute old
        });

        const initialLocation = {
          lat: initialPosition.coords.latitude,
          lng: initialPosition.coords.longitude
        };

        setUserLocation(initialLocation);
        setIsLocationEnabled(true);

        // Create initial marker
        const marker = new google.maps.Marker({
          position: initialLocation,
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
      } catch (initialError) {
        console.warn('Initial position failed, will wait for watch:', initialError);
      }

      // Start watching position for real-time updates with more relaxed settings
      const id = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000 // Accept positions up to 5 seconds old
        },
        (position, err) => {
          if (err) {
            // Only log POSITION_UNAVAILABLE errors, don't show them to user if we have a position
            if (err.code === 2) { // POSITION_UNAVAILABLE
              console.warn('Location temporarily unavailable:', err.message);
              // Don't set error if we already have a location
              if (!userLocation) {
                setLocationError('Searching for GPS signal...');
              }
              return;
            }

            const errorMessage = `Location error: ${err.message || 'Unknown error'}`;
            setLocationError(errorMessage);
            console.error('Geolocation error:', err);
            return;
          }

          if (position) {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            setUserLocation(newLocation);
            setIsLocationEnabled(true);
            setLocationError(null); // Clear any previous errors

            // Update or create marker
            setUserLocationMarker((prevMarker) => {
              if (prevMarker) {
                prevMarker.setPosition(newLocation);
                return prevMarker;
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
                return marker;
              }
            });
          }
        }
      );

      setWatchId(id);
    } catch (error: any) {
      const errorMessage = `Location error: ${error.message || 'Unknown error'}`;
      setLocationError(errorMessage);
      console.error('Geolocation error:', error);
    }
  }, []);

  const centerOnUserLocation = useCallback((map: google.maps.Map | null) => {
    if (map && userLocation) {
      map.setCenter(userLocation);
      map.setZoom(20);
    }
  }, [userLocation]);

  const toggleLocationTracking = useCallback(async (map: google.maps.Map | null) => {
    if (isLocationEnabled) {
      // Disable location
      if (watchId) {
        await Geolocation.clearWatch({ id: watchId });
        setWatchId(null);
      }
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
  }, [isLocationEnabled, watchId, userLocationMarker, getCurrentLocation]);

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

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId }).catch(error => {
          console.error('Failed to clear watch on unmount:', error);
        });
      }
    };
  }, [watchId]);

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
