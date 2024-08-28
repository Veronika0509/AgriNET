import {getTempMarkerChartData} from "../../../../data/types/temp/getTempMarkerChartData";

let id = 0
let tempChartData: any = []
let boundsArray: any = []
let invalidChartData: any = []

export const createTempMarker = (
  tempChartsAmount: any,
  sensorItem: any,
  page: any,
  userId: any,
  setInvalidTempChartDataContainer: any,
  setTempChartDataContainer: any
) => {
  const exists = tempChartsAmount.some((secondItemTemp: any) => secondItemTemp.id === sensorItem.id);
  if (!exists) {
    id += 1
    tempChartsAmount.push(sensorItem);
    const bounds: any = new google.maps.LatLngBounds(
      new google.maps.LatLng(sensorItem.lat, sensorItem.lng),
      new google.maps.LatLng(sensorItem.lat + 0.0001, sensorItem.lng + 0.0001)
    )
    if (page === 1) {
      getTempMarkerChartData(
        sensorItem.id,
        sensorItem.sensorId,
        bounds,
        sensorItem.name,
        userId,
        tempChartsAmount,
        setInvalidTempChartDataContainer,
        setTempChartDataContainer,
        id,
        tempChartData,
        boundsArray,
        invalidChartData
      )
    }
  }
}