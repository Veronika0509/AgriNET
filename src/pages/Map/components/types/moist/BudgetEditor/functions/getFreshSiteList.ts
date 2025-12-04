import {getNewData} from "./getNewData";

export const getFreshSiteList = async (props: any) => {
  const checkedSites: any = props.siteList.filter((site: any) => {
    return site.layers.find((layer: any) =>
      //layer.name === "Nprobe"
      (layer.name === "Moist" || layer.name === "moist")
    ) != null
  })

  props.setSites(checkedSites)

  // Find the site that contains the current sensor if it's set
  let siteToUse = checkedSites[0]
  if (props.currentSensorId) {
    const siteWithSensor = checkedSites.find((site: any) => {
      return site.layers.some((layer: any) => {
        if (layer.name === 'Moist' || layer.name === 'moist') {
          return layer.markers.some((marker: any) => marker.sensorId === props.currentSensorId)
        }
        return false
      })
    })
    if (siteWithSensor) {
      siteToUse = siteWithSensor
    }
  }

  props.setCurrentSite(siteToUse.name)
  siteToUse.layers.map((layer: any) => {
    if (layer.name === 'Moist' || layer.name === 'moist') {
      props.setMoistSensors((prev: any[]) => {
        const existingIds = new Set(prev.map(marker => marker.sensorId))
        const newMarkers = layer.markers.filter((marker: any) => !existingIds.has(marker.sensorId))
        return [...prev, ...newMarkers]
      })

      // Use existing currentSensorId if it's set, otherwise use the first marker
      const sensorIdToUse = props.currentSensorId || layer.markers[0].sensorId
      props.setCurrentSensorId(sensorIdToUse)

      // Find the marker for the selected sensor to center the map
      const selectedMarker = layer.markers.find((marker: any) => marker.sensorId === sensorIdToUse) || layer.markers[0]

      props.setMap(
        new window.google.maps.Map(props.mapRef.current, {
          center: {lat: selectedMarker.lat, lng: selectedMarker.lng},
          zoom: 15,
          mapTypeId: "satellite",
        })
      );
      getNewData(props.currentAmountOfDays, sensorIdToUse, props.setChartData, props.setDataExists, sensorIdToUse)
    }
  })
}