import {getNewData} from "./getNewData";

export const getFreshSiteList = async (props: any) => {
  let checkedSites: any = props.siteList.filter((site: any) => {
    return site.layers.find((layer: any) =>
      (layer.name == "Moist" || layer.name == "Nprobe" || layer.name == "moist")
    ) != null
  })

  props.setSites(checkedSites)
  props.setCurrentSite(checkedSites[0].name)
  checkedSites[0].layers.map((layer: any) => {
    if (layer.name === 'Moist' || layer.name === 'moist') {
      props.setMoistSensors((prev: any[]) => {
        const existingIds = new Set(prev.map(marker => marker.sensorId))
        const newMarkers = layer.markers.filter((marker: any) => !existingIds.has(marker.sensorId))
        return [...prev, ...newMarkers]
      })
      props.setCurrentSensorId(layer.markers[0].sensorId)
      props.setMap(
        new window.google.maps.Map(props.mapRef.current, {
          center: {lat: layer.markers[0].lat, lng: layer.markers[0].lng},
          zoom: 15,
          mapTypeId: "satellite",
        })
      );
      getNewData(props.currentAmountOfDays, props.currentSensorId, props.setChartData, props.setDataExists, layer.markers[0].sensorId)
    }
  })
}