export const createMap = (map: any, setMap: any, mapRef: any) => {
  if (mapRef.current && !map) {
    const initMap = new window.google.maps.Map(mapRef.current, {
      center: {lat: 46.093354, lng: -118.274636},
      zoom: 18,
      mapTypeId: "satellite",
    });
    setMap(initMap);
  }
}