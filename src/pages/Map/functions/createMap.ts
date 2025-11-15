import React from 'react';

export const createMap = (
  map: google.maps.Map | null,
  setMap: (map: google.maps.Map) => void,
  mapRef: React.RefObject<HTMLDivElement>
) => {
  if (mapRef.current && !map) {
    const initMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 37.7749, lng: -122.4194 },
      mapTypeId: "satellite",
      minZoom: 2,
      zoom: 8,
      mapId: '92dbe7f09fe8e0a5',
      // Keep all controls but disable the default UI to prevent built-in location button
      disableDefaultUI: true,
      // Re-enable only the controls we want
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: true,
      rotateControl: true,
      fullscreenControl: true,
      // Note: By not including any location/geolocation control, the built-in location button is disabled
    });
    setMap(initMap);
  }
}