export const createMap = (map: any, setMap: any, mapRef: any) => {
  if (mapRef.current && !map) {
    const initMap = new window.google.maps.Map(mapRef.current, {
      mapTypeId: "satellite",
      minZoom: 2
    });
    setMap(initMap);
  }
}