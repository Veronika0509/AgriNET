import {getSensorItems} from "../../data/getSensorItems";

export const pushAllCoordinates = (
  sensorItem: any,
  allCoordinatesOfMarkers: any,
  siteList: any,
  setIsAllCoordinatesOfMarkersAreReady: any
) => {
  const lat = sensorItem.lat
  const lng = sensorItem.lng
  const id = sensorItem.sensorId
  const type: string = sensorItem.markerType
  const allSensorItems = getSensorItems(undefined, siteList)
  let neededSensorItemsArray: any = []
  allSensorItems.map((neededSensorItem: any) => {
    if (neededSensorItem.markerType === 'moist-fuel' || neededSensorItem.markerType === 'wxet') {
      neededSensorItemsArray.push(neededSensorItem)
    }
  })
  if (type === 'moist-fuel' || type === 'wxet') {
    allCoordinatesOfMarkers.push({lat, lng, id})
  }
  if (allCoordinatesOfMarkers.length === neededSensorItemsArray.length) {
    setIsAllCoordinatesOfMarkersAreReady(allCoordinatesOfMarkers)
  }
}