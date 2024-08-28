import {getWxetMarkerChartData} from "../../../../data/types/wxet/getWxetMarkerChartData";

let id = 0
let wxetData: any = []
let boundsArray: any = []
let invalidChartData: any = []
export const createWxetMarker = (
  wxetChartsAmount: any,
  sensorItem: any,
  page: any,
  userId: any,
  setInvalidWxetChartDataContainer: any,
  setWxetChartDataContainer: any
) => {
  const exists = wxetChartsAmount.some((secondItemTemp: any) => secondItemTemp.id === sensorItem.id);
  if (!exists) {
    id += 1
    wxetChartsAmount.push(sensorItem);
    const bounds: any = new google.maps.LatLngBounds(
      new google.maps.LatLng(sensorItem.lat, sensorItem.lng),
      new google.maps.LatLng(sensorItem.lat + 0.0001, sensorItem.lng + 0.0001)
    )
    if (page === 1) {
      getWxetMarkerChartData(
        sensorItem.id,
        sensorItem.sensorId,
        bounds,
        sensorItem.name,
        userId,
        setInvalidWxetChartDataContainer,
        setWxetChartDataContainer,
        wxetChartsAmount,
        id,
        wxetData,
        boundsArray,
        invalidChartData
      );
    }
  }
}