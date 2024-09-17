import {getMoistMarkerChartData} from "../../../../data/types/moist/getMoistMarkerChartData";
import axios from "axios";

export const createMoistMarker = async (
  moistChartsAmount: any,
  sensorItem: any,
  page: any,
  userId: any,
  setInvalidMoistChartDataContainer: any,
  setMoistChartDataContainer: any,
  moistId: any,
  moistInvalidChartData: any,
  moistChartData: any,
  boundsArray: any
) => {
  const exists = moistChartsAmount.some((secondItemMoist: any) => secondItemMoist.id === sensorItem.id);
  if (!exists) {
    const response = await axios.get('https://app.agrinet.us/api/map/moist-fuel?v=43', {
      params: {
        sensorId: sensorItem.sensorId,
        cacheFirst: true,
        'do-not-catch-error': '',
        user: userId,
      },
    })
    moistId.value++;
    moistChartsAmount.push(sensorItem);
    const bounds: any = new google.maps.LatLngBounds(
      new google.maps.LatLng(sensorItem.lat, sensorItem.lng),
      new google.maps.LatLng(sensorItem.lat + 0.0001, sensorItem.lng + 0.0001)
    )
    if (page === 1) {
      getMoistMarkerChartData(
        sensorItem.id,
        sensorItem.sensorId,
        bounds,
        sensorItem.name,
        setInvalidMoistChartDataContainer,
        setMoistChartDataContainer,
        moistChartsAmount,
        moistId,
        moistChartData,
        boundsArray,
        moistInvalidChartData,
        response
      );
    }
  }
}