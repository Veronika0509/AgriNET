import {getSensorItems} from "../data/getSensorItems";

export const pushAllCoordinates = (
  sensorItem: any,
  allCoordinatesOfMarkers: any,
  siteList: any,
  setCoordinatesForFitting: any,
  siteName: string
) => {
  const lat = sensorItem.lat
  const lng = sensorItem.lng
  const id = sensorItem.sensorId
  const mainId = sensorItem.id
  const type: string = sensorItem.markerType
  const allSensorItems = getSensorItems(undefined, siteList, siteName)
  let neededSensorItemsArray: any = []
  allSensorItems.map((neededSensorItem: any) => {
    if (neededSensorItem.markerType === 'moist-fuel' || neededSensorItem.markerType === 'wxet' || neededSensorItem.markerType === 'temp-rh-v2' || neededSensorItem.markerType === 'valve') {
      neededSensorItemsArray.push(neededSensorItem)
    }
  })
  if (type === 'moist-fuel' || type === 'wxet' || type === 'temp-rh-v2' || type === 'valve') {
    const exists = allCoordinatesOfMarkers.some((marker: any) => marker.id === id);

    if (!exists) {
      allCoordinatesOfMarkers.push({ lat, lng, id, mainId });
    }
  }
  if (allCoordinatesOfMarkers.length === neededSensorItemsArray.length) {
    setCoordinatesForFitting(allCoordinatesOfMarkers)
  }
}