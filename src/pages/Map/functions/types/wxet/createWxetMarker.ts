import {createWxetDataContainers} from "./createWxetDataContainers";
import axios from "axios";

export const createWxetMarker = async (
  wxetChartsAmount: any,
  sensorItem: any,
  page: any,
  userId: any,
  setInvalidWxetChartDataContainer: any,
  setWxetChartDataContainer: any,
  wxetId: any,
  wxetData: any,
  wxetBoundsArray: any,
  wxetInvalidChartData: any,
  countWxet: number
) => {
  const exists = wxetChartsAmount.some((secondItemTemp: any) => secondItemTemp.id === sensorItem.id);
  if (!exists) {
    const response = await axios.get('https://app.agrinet.us/api/map/wx', {
      params: {
        sensorId: sensorItem.sensorId,
        cacheFirst: true,
        'do-not-catch-error': '',
        user: userId,
        v: 43
      },
    })
    wxetId.value++;
    wxetChartsAmount.push(sensorItem);
    const bounds: any = new google.maps.LatLngBounds(
      new google.maps.LatLng(sensorItem.lat, sensorItem.lng),
      new google.maps.LatLng(sensorItem.lat + 0.0001, sensorItem.lng + 0.0001)
    )
    if (page === 1) {
      createWxetDataContainers({
        mainId: sensorItem.id,
        sensorId: sensorItem.sensorId,
        bounds,
        name: sensorItem.name,
        setInvalidWxetChartDataContainer,
        setWxetChartDataContainer,
        wxetChartsAmount,
        wxetId,
        wxetData,
        boundsArray: wxetBoundsArray,
        invalidChartData: wxetInvalidChartData,
        response,
        countWxet
      });
    }
  }
}