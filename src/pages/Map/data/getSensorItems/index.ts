export const getSensorItems = (markerType: string | undefined, siteList: any) => {
  const sensorItems: any = []
  siteList.map((sensors: any) => {
    sensors.layers.map((sensor: any) => {
      sensor.markers.map(async (sensorItem: any) => {
        if (markerType) {
          if (sensorItem.markerType === markerType) {
            sensorItems.push(sensorItem)
          }
        } else {
          sensorItems.push(sensorItem)
        }
      })
    })
  })
  return sensorItems
}