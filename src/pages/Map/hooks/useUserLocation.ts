import { useState, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

// Shared by every place that needs to know "is this a phone/tablet, on web or native" -
// keeping one definition means the location button, its auto-request-on-mount effect, and
// its visibility check can never disagree with each other about what counts as mobile.
export const isMobileOrTouchDevice = (): boolean => {
  const userAgent = navigator.userAgent;
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|IEMobile|Opera Mini|Mobile|Tablet/i.test(userAgent);
  // navigator.maxTouchPoints > 1 catches touch devices whose user-agent alone looks like a
  // desktop - most notably iPadOS Safari, which has reported a plain "Macintosh" UA (desktop
  // site request) by default since iOS 13, even though an iPad is very much a mobile device.
  const isTouchDevice = navigator.maxTouchPoints > 1;
  return isMobileUserAgent || isTouchDevice;
};

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

      // Capacitor's web shim has no explicit "request permission" step - calling
      // requestPermissions() there always throws "Not implemented on web". On web, the
      // browser itself pops its own permission prompt as soon as getCurrentPosition()/
      // watchPosition() is called below, so there's nothing to do here except on native.
      if (Capacitor.isNativePlatform()) {
        // Check and request permissions using Capacitor. Any state other than 'granted'
        // ('prompt', 'prompt-with-rationale', or 'denied') needs a fresh request - in
        // particular, after a single denial Android reports 'prompt-with-rationale', not
        // 'denied', and the OS *will* show the permission dialog again for that state. Only
        // checking for 'denied' here missed that case, so tapping the button again after the
        // first refusal silently tried to read the position without ever re-asking for access.
        const permission = await Geolocation.checkPermissions();

        if (permission.location !== 'granted') {
          const requestResult = await Geolocation.requestPermissions();
          if (requestResult.location !== 'granted') {
            // If Android still reports 'prompt-with-rationale' here, the OS dialog was shown
            // again but the user just said no once more - a plain retry will still work next
            // time. Once it's fully 'denied' (typically after 2 refusals), Android will no
            // longer show the dialog at all, and only the phone's own Settings can fix it.
            setLocationError(
              requestResult.location === 'denied'
                ? 'Location access is blocked. Enable it in your device Settings > Apps > AgriNET > Permissions.'
                : 'Location permission denied'
            );
            return;
          }
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
    if (map && !userLocation && !isLocationEnabled && !locationError && isMobileOrTouchDevice()) {
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
