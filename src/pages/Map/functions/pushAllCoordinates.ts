import {getSensorItems} from "../data/getSensorItems";

export const pushAllCoordinates = (
  sensorItem: any,
  allCoordinatesOfMarkers: any,
  siteList: any,
  setCoordinatesForFitting: any,
  siteName: string,
  type: string
) => {
  const lat = sensorItem.lat
  const lng = sensorItem.lng
  const id = sensorItem.sensorId
  const mainId = sensorItem.id
  let neededSensorItemsArray: any = []
  siteList.map((site: any) => {
    if (site.name === siteName) {
      site.layers.map((layer: any) => {
        if (layer.name === 'Moist' || layer.name === 'moist' || layer.name === 'SoilTemp' || layer.name === 'WXET' || layer.name === 'Valve' || layer.name === 'EXTL') {
          layer.markers.map((marker: any) => {
            if (!neededSensorItemsArray.some((item: any) => item.sensorId === marker.sensorId)) {
              neededSensorItemsArray.push(marker);
            }
          })
        }
      })
    }
  })
  if (type === 'Moist' || type === 'WXET' || type === 'SoilTemp' || type === 'Valve' || type === 'EXTL') {
    const exists = allCoordinatesOfMarkers.some((marker: any) => marker.id === id);

    if (!exists) {
      allCoordinatesOfMarkers.push({ lat, lng, id, mainId });
    }
  }
  if (allCoordinatesOfMarkers.length === neededSensorItemsArray.length) {
    setCoordinatesForFitting(allCoordinatesOfMarkers)
  }
}