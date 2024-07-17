import {moistMarkerChartDataRequest} from "../../../../data/types/moist/moistMarkerChartDataRequest";

let id = 0
let invalidChartData: any = []
export const createMoistMarker = (
  moistChartsAmount: any,
  sensorItem: any,
  page: any,
  userId: any,
  setInvalidMoistChartDataContainer: any,
  setMoistChartDataContainer: any,
  moistChartData: any,
  boundsArray: any
) => {
  const exists = moistChartsAmount.some((secondItemMoist: any) => secondItemMoist.id === sensorItem.id);
  if (!exists) {
    id += 1
    moistChartsAmount.push(sensorItem);
    const bounds: any = new google.maps.LatLngBounds(
      new google.maps.LatLng(sensorItem.lat, sensorItem.lng),
      new google.maps.LatLng(sensorItem.lat + 0.0001, sensorItem.lng + 0.0001)
    )
    if (page === 1) {
      moistMarkerChartDataRequest(
        sensorItem.id,
        sensorItem.sensorId,
        bounds,
        sensorItem.name,
        userId,
        setInvalidMoistChartDataContainer,
        setMoistChartDataContainer,
        moistChartsAmount,
        id,
        moistChartData,
        boundsArray,
        invalidChartData
      );
    }
  }
}