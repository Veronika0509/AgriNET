import {getSensorItems} from "../../data/getSensorItems";
import {moistChartDataRequest} from "../../data/moistChartDataRequest";
import {createSensorsMarkers} from "../createSensorsMarkers";
import s from '../../style.module.css'
import login from "../../../Login";

export const setGroupMarkers = (page: any, map: any, siteList: any, markers: any, setMarkers: any, setSensorName: any, setSensorId: any, setSensorType: any, setIsModalOpen: any, setIsChartDataIsLoading: any, setIsSelectDisabled: any, setChartData: any, moistFuelChartsAmount: any, userId: any, setInvalidChartDataContainer: any, setMoistChartDataContainer: any, allMoistFuelCoordinatesOfMarkers: any, setIsAllMoistFuelCoordinatesOfMarkersAreReady: any, existingMarkers: any) => {
  if (markers.length === 0) {
    const newMarkers = siteList.map((sensorsGroupData: any) => {
      let groupMarker: any = new google.maps.Marker({
        position: {lat: sensorsGroupData.lat, lng: sensorsGroupData.lng},
        map: map,
        title: sensorsGroupData.name,
      });
      const info: string = `<p class="infoWindowText">${sensorsGroupData.name}</p>`
      const infoWindow = new google.maps.InfoWindow({
        content: info,
      });
      infoWindow.open(map, groupMarker);
      groupMarker.addListener('click', async () => {
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
                  moistChartDataRequest(sensorItem.sensorId, bounds, sensorItem.name, userId, setInvalidChartDataContainer, setMoistChartDataContainer, moistFuelChartsAmount);
                }
              }
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
        }))
        groupMarker.setMap(null)
      })
    });
    setMarkers(newMarkers);
  }
}