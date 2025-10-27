interface SensorItem {
  lat: number;
  lng: number;
  sensorId: string | number;
  id: string | number;
  [key: string]: unknown;
}

interface Marker {
  sensorId: string | number;
  [key: string]: unknown;
}

interface Layer {
  name: string;
  markers: Marker[];
}

interface Site {
  name: string;
  layers: Layer[];
}

interface Coordinate {
  lat: number;
  lng: number;
  id: string | number;
  mainId: string | number;
}

export const pushAllCoordinates = (
  sensorItem: SensorItem,
  allCoordinatesOfMarkers: Coordinate[],
  siteList: Site[],
  setCoordinatesForFitting: (coords: Coordinate[]) => void,
  siteName: string,
  type: string
): void => {
  const lat = sensorItem.lat
  const lng = sensorItem.lng
  const id = sensorItem.sensorId
  const mainId = sensorItem.id
  const neededSensorItemsArray: Marker[] = []
  siteList.map((site: Site) => {
    if (site.name === siteName) {
      site.layers.map((layer: Layer) => {
        if (layer.name === 'Moist' || layer.name === 'moist' || layer.name === 'SoilTemp' || layer.name === 'WXET' || layer.name === 'Valve' || layer.name === 'EXTL') {
          layer.markers.map((marker: Marker) => {
            if (!neededSensorItemsArray.some((item: Marker) => item.sensorId === marker.sensorId)) {
              neededSensorItemsArray.push(marker);
            }
          })
        }
      })
    }
  })
  if (type === 'Moist' || type === 'WXET' || type === 'SoilTemp' || type === 'Valve' || type === 'EXTL') {
    const exists = allCoordinatesOfMarkers.some((marker: Coordinate) => marker.id === id);

    if (!exists) {
      allCoordinatesOfMarkers.push({ lat, lng, id, mainId });
    }
  }
  if (allCoordinatesOfMarkers.length === neededSensorItemsArray.length) {
    setCoordinatesForFitting(allCoordinatesOfMarkers)
  }
}