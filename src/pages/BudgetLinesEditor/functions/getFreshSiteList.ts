import {getNewData} from "./getNewData";

export const getFreshSiteList = async (props: any) => {
  const checkedSites: any = props.siteList.filter((site: any) => {
    return site.layers.find((layer: any) =>
      //layer.name === "Nprobe"
      (layer.name === "Moist" || layer.name === "moist")
    ) != null
  })

  props.setSites(checkedSites)

  let targetSite = checkedSites[0]
  let targetSensorId: string | undefined

  if (props.targetSensorId) {
    for (const site of checkedSites) {
      for (const layer of site.layers) {
        if (layer.name === 'Moist' || layer.name === 'moist') {
          const found = layer.markers.find((m: any) => m.sensorId === props.targetSensorId)
          if (found) {
            targetSite = site
            targetSensorId = props.targetSensorId
            break
          }
        }
      }
      if (targetSensorId) break
    }
  }

  props.setCurrentSite(targetSite.name)
  targetSite.layers.map((layer: any) => {
    if (layer.name === 'Moist' || layer.name === 'moist') {
      // Remove duplicates by sensorId - keep only the first occurrence
      const uniqueMarkers = layer.markers.filter((marker: any, index: number, self: any[]) =>
        index === self.findIndex((m: any) => m.sensorId === marker.sensorId)
      )

      props.setMoistSensors((prev: any[]) => {
        const existingIds = new Set(prev.map(marker => marker.sensorId))
        const newMarkers = uniqueMarkers.filter((marker: any) => !existingIds.has(marker.sensorId))
        return [...prev, ...newMarkers]
      })

      const initialSensor = targetSensorId
        ? uniqueMarkers.find((m: any) => m.sensorId === targetSensorId) ?? uniqueMarkers[0]
        : uniqueMarkers[0]

      props.setCurrentSensorId(initialSensor.sensorId)
      props.setMap(
        new window.google.maps.Map(props.mapRef.current, {
          center: {lat: initialSensor.lat, lng: initialSensor.lng},
          zoom: 15,
          mapTypeId: "satellite",
        })
      );
      getNewData(props.currentAmountOfDays, props.currentSensorId, props.setChartData, props.setDataExists, initialSensor.sensorId)
    }
  })
}