import {getSensorItems} from "../data/getSensorItems";

export const pushAllCoordinates = (
  sensorItem: any,
  allCoordinatesOfMarkers: any,
  siteList: any,
  setIsAllCoordinatesOfMarkersAreReady: any,
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
    if (neededSensorItem.markerType === 'moist-fuel' || neededSensorItem.markerType === 'wxet' || neededSensorItem.markerType === 'temp-rh-v2') {
      neededSensorItemsArray.push(neededSensorItem)
    }
  })
  if (type === 'moist-fuel' || type === 'wxet' || type === 'temp-rh-v2') {
    allCoordinatesOfMarkers.push({lat, lng, id, mainId})
  }
  if (allCoordinatesOfMarkers.length === neededSensorItemsArray.length) {
    setIsAllCoordinatesOfMarkersAreReady(allCoordinatesOfMarkers)
  }
}