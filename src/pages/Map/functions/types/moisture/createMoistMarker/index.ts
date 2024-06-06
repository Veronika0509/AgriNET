import {moistChartDataRequest} from "../../../../data/types/moisture/moistChartDataRequest";

export const createMoistMarker = (moistFuelChartsAmount: any,
                                  sensorItem: any,
                                  page: any,
                                  userId: any,
                                  setInvalidMoistChartDataContainer: any,
                                  setMoistChartDataContainer: any
) => {
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
        setInvalidMoistChartDataContainer,
        setMoistChartDataContainer,
        moistFuelChartsAmount
      );
    }
  }
}