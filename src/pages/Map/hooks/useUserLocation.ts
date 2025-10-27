import { useState, useCallback } from 'react';

export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [userLocationMarker, setUserLocationMarker] = useState<google.maps.Marker | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getCurrentLocation = useCallback((map: google.maps.Map | null) => {
    if (!map) return;

    if (navigator.geolocation) {
      setLocationError(null);
      
      // Try high accuracy first
      navigator.geolocation.getCurrentPosition(
        (position) => {
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
        },
        (error) => {
          console.warn('High accuracy geolocation failed, trying low accuracy:', error);
          
          // Fallback to low accuracy
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const newLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              
              setUserLocation(newLocation);
              setIsLocationEnabled(true);
              
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
                    fillOpacity: 0.6,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2
                  },
                  title: 'Your Location (Low Accuracy)'
                });
                setUserLocationMarker(marker);
              }
            },
            (lowAccError) => {
              const errorMessage = `Location error: ${lowAccError.message}`;
              setLocationError(errorMessage);
              console.error('Geolocation error:', lowAccError);
            },
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 300000 // 5 minutes
            }
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      const errorMessage = 'Geolocation is not supported by this browser';
      setLocationError(errorMessage);
      console.error(errorMessage);
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
