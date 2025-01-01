import {createTempDataContainers} from "./createTempDataContainers";
import axios from "axios";

export const createTempMarker = async (
  tempChartsAmount: any,
  sensorItem: any,
  page: any,
  userId: any,
  setInvalidTempChartDataContainer: any,
  setTempChartDataContainer: any,
  tempId: any,
  tempChartData: any,
  tempBoundsArray: any,
  tempInvalidChartData: any,
  countTemp: number
) => {
  console.log('prove')
  const exists = tempChartsAmount.some((secondItemTemp: any) => secondItemTemp.id === sensorItem.id);
  if (!exists) {
    const response = await axios.get('https://app.agrinet.us/api/map/temp-data-v2?v=43', {
      params: {
        sensorId: sensorItem.sensorId,
        userId: userId,
        'do-not-catch-error': ''
      },
    })
    tempId.value++;
    tempChartsAmount.push(sensorItem);
    const bounds: any = new google.maps.LatLngBounds(
      new google.maps.LatLng(sensorItem.lat, sensorItem.lng),
      new google.maps.LatLng(sensorItem.lat + 0.0001, sensorItem.lng + 0.0001)
    )
    if (page === 1) {
      createTempDataContainers({
        mainId: sensorItem.id,
        sensorId: sensorItem.sensorId,
        bounds,
        name: sensorItem.name,
        tempChartsAmount,
        setInvalidTempChartDataContainer,
        setTempChartDataContainer,
        id: tempId,
        tempChartData,
        boundsArray: tempBoundsArray,
        invalidChartData: tempInvalidChartData,
        response,
        countTemp
      })
    }
  }
}