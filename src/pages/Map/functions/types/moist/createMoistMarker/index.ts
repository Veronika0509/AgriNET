import {moistMarkerChartDataRequest} from "../../../../data/types/moist/moistMarkerChartDataRequest";

export const createMoistMarker = (
  moistChartsAmount: any,
  sensorItem: any,
  page: any,
  userId: any,
  setInvalidMoistChartDataContainer: any,
  setMoistChartDataContainer: any
) => {
  const exists = moistChartsAmount.some((secondItemMoist: any) => secondItemMoist.id === sensorItem.id);
  if (!exists) {
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
        moistChartsAmount
      );
    }
  }
}