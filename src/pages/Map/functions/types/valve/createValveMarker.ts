import {createValveDataContainers} from "./createValveDataContainers";
import axios from "axios";

export const createValveMarker = async (
  valveChartsAmount: any,
  sensorItem: any,
  page: any,
  userId: any,
  setInvalidValveChartDataContainer: any,
  setValveChartDataContainer: any,
  valveId: any,
  valveChartData: any,
  valveBoundsArray: any,
  valveInvalidChartData: any,
  countValve: number
) => {
  const exists = valveChartsAmount.some((secondItemValve: any) => secondItemValve.id === sensorItem.id);
  if (!exists) {
    const response = await axios.get('https://app.agrinet.us/api/map/valve?v=43', {
      params: {
        sensorId: sensorItem.sensorId,
        userId: userId,
        'do-not-catch-error': ''
      },
    })
    valveId.value++;
    valveChartsAmount.push(sensorItem);
    const bounds: any = new google.maps.LatLngBounds(
      new google.maps.LatLng(sensorItem.lat, sensorItem.lng),
      new google.maps.LatLng(sensorItem.lat + 0.0001, sensorItem.lng + 0.0001)
    )
    if (page === 1) {
      createValveDataContainers({
        mainId: sensorItem.id,
        sensorId: sensorItem.sensorId,
        bounds,
        name: sensorItem.name,
        valveChartsAmount,
        setInvalidValveChartDataContainer,
        setValveChartDataContainer,
        id: valveId,
        valveChartData,
        boundsArray: valveBoundsArray,
        invalidChartData: valveInvalidChartData,
        data: response.data,
        countValve
      })
    }
  }
}