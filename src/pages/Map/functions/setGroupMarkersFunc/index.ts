import {getSensorItems} from "../../data/getSensorItems";
import {moistChartDataRequest} from "../../data/moistChartDataRequest";
import {createSensorsMarkers} from "../createSensorsMarkersFunc";
import s from '../../style.module.css'

export const setGroupMarkers = (map: any, siteList: any, markers: any, setMarkers: any, setSensorName: any, setSensorId: any, setSensorType: any, setIsModalOpen: any, setIsChartDataIsLoading: any, setIsSelectDisabled: any, setChartData: any, moistFuelChartsAmount: any, userId: any, setInvalidChartDataContainer: any, setMoistChartDataContainer: any, allMoistFuelCoordinatesOfMarkers: any, setIsAllMoistFuelCoordinatesOfMarkersAreReady: any, existingMarkers: any) => {
  if (map && siteList.length > 0 && markers.length === 0) {
    const newMarkers = siteList.map((sensorsGroupData: any) => {
      const groupMarker = new google.maps.Marker({
        position: {lat: sensorsGroupData.lat, lng: sensorsGroupData.lng},
        map: map,
        title: sensorsGroupData.name,
      });
      const info: string = `<p class="infoWindowText">${sensorsGroupData.name}</p>`
      const infoWindow = new google.maps.InfoWindow({
        content: info,
      });
      infoWindow.open(map, groupMarker);
      groupMarker.addListener('click', () => {
        groupMarker.setMap(null)
        siteList.map(async (sensors: any) => {
          const sensorItems = getSensorItems(undefined, siteList)
          for (const sensorItem of sensorItems) {
            if (sensorItem.markerType === 'moist-fuel') {
              moistFuelChartsAmount.push(sensorItem);
              const bounds: any = new google.maps.LatLngBounds(
                new google.maps.LatLng(sensorItem.lat, sensorItem.lng),
                new google.maps.LatLng(sensorItem.lat + 0.0001, sensorItem.lng + 0.0001)
              )
              moistChartDataRequest(sensorItem.sensorId, bounds, sensorItem.name, userId, setInvalidChartDataContainer, setMoistChartDataContainer, moistFuelChartsAmount);
            } else {
              createSensorsMarkers(sensorItem, map, setSensorName, setSensorId, setSensorType, setIsModalOpen, setIsChartDataIsLoading, setIsSelectDisabled, setChartData, existingMarkers)
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
          }
        });
      });
    });
    setMarkers(newMarkers);
  }
}