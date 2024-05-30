import {getSensorItems} from "../../data/getSensorItems";
import {moistChartDataRequest} from "../../data/moistChartDataRequest";

export const onSiteClick = async (page: any,
                                  moistFuelChartsAmount: any,
                                  userId: any,
                                  setInvalidChartDataContainer: any,
                                  setMoistChartDataContainer: any,
                                  allMoistFuelCoordinatesOfMarkers: any,
                                  setIsAllMoistFuelCoordinatesOfMarkersAreReady: any,
                                  siteList: any,
                                  map: any,
                                  groupMarker: any,
                                  sensorsGroupData: any,
                                  setSecondMap: any
) => {
  setSecondMap(sensorsGroupData.name)
  let boundsToFit = new google.maps.LatLngBounds();
  await Promise.all(siteList.map(async () => {
    const sensorItems = getSensorItems(undefined, siteList)
    sensorItems.map((sensorItem: any) =>  {
      if (sensorItem.markerType === 'moist-fuel') {
        const exists = moistFuelChartsAmount.some((secondItemMoist: any) => secondItemMoist.sensorId === sensorItem.sensorId);
        if (!exists) {
          moistFuelChartsAmount.push(sensorItem);
          const bounds: any = new google.maps.LatLngBounds(
            new google.maps.LatLng(sensorItem.lat, sensorItem.lng),
            new google.maps.LatLng(sensorItem.lat + 0.0001, sensorItem.lng + 0.0001)
          )
          if (page === 1) {
            moistChartDataRequest(sensorItem.sensorId,
              bounds,
              sensorItem.name,
              userId,
              setInvalidChartDataContainer,
              setMoistChartDataContainer,
              moistFuelChartsAmount
            );
          }
        }
        boundsToFit.extend(new google.maps.LatLng(sensorItem.lat, sensorItem.lng))
      } else {
        // createSensorsMarkers(sensorItem, map, setSensorName, setSensorId, setSensorType, setIsModalOpen, setIsChartDataIsLoading, setIsSelectDisabled, setChartData, existingMarkers)
      }
      const lat = sensorItem.lat
      const lng = sensorItem.lng
      const id = sensorItem.sensorId
      const type: string = sensorItem.markerType
      const moistFuelSensorItems = getSensorItems('moist-fuel', siteList)
      if (type === 'moist-fuel') {
        allMoistFuelCoordinatesOfMarkers.push({lat, lng, id})
      }
      if (allMoistFuelCoordinatesOfMarkers.length === moistFuelSensorItems.length) {
        setIsAllMoistFuelCoordinatesOfMarkersAreReady(allMoistFuelCoordinatesOfMarkers)
      }
    })
    map.fitBounds(boundsToFit)
  }))
  groupMarker.setMap(null)
}