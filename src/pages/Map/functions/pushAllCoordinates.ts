
interface SensorItem {
  lat: number;
  lng: number;
  sensorId: string;
  id: string | number;
  [key: string]: unknown;
}

interface Marker {
  sensorId: string;
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
  _siteList: Site[],
  setCoordinatesForFitting: (coords: Coordinate[]) => void,
  allSensorItems: Marker[],
  _siteName: string,
  type: string
): void => {
  const lat = sensorItem.lat
  const lng = sensorItem.lng
  const id = sensorItem.sensorId
  const mainId = sensorItem.id
  const neededSensorItemsArray: Marker[] = []
  allSensorItems.map((sensItem: Marker) => {
    if (sensItem.markerType === 'moist-fuel' || sensItem.markerType === 'wxet' || sensItem.markerType === 'fuel' || sensItem.markerType === 'temp-rh-v2' || sensItem.markerType === 'soiltemp' || sensItem.markerType === 'temp-rh' || sensItem.markerType === 'valve' || sensItem.markerType === 'extl' || sensItem.markerType === 'graphic') {
      if (!neededSensorItemsArray.some((item: Marker) => item.id === sensItem.id)) {
        neededSensorItemsArray.push(sensItem);
      }
    }
  })
  // siteList.map((site: Site) => {
  //   if (site.name === siteName) {
  //     site.layers.map((layer: Layer) => {
  //       if (layer.name === 'Moist' || layer.name === 'moist' || layer.name === 'SoilTemp' || layer.name === 'WXET' || layer.name === 'Valve' || layer.name === 'EXTL') {
  //         layer.markers.map((marker: Marker) => {
  //           if (!neededSensorItemsArray.some((item: Marker) => item.id === marker.id)) {
  //             neededSensorItemsArray.push(marker);
  //           }
  //         })
  //       }
  //     })
  //   }
  // })
  if (type === 'Moist' || type === 'WXET' || type === 'SoilTemp' || type === 'Valve' || type === 'EXTL') {
    const exists = allCoordinatesOfMarkers.some((marker: Coordinate) => marker.mainId === mainId);

    if (!exists) {
      allCoordinatesOfMarkers.push({ lat, lng, id, mainId });
    }
  }
  if (allCoordinatesOfMarkers.length === neededSensorItemsArray.length) {
    setCoordinatesForFitting(allCoordinatesOfMarkers)
  }
}