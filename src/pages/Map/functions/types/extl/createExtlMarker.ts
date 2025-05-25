import {createExtlDataContainer} from "./createExtlDataContainer";


export const createExtlMarker = async (
  extlChartsAmount: any,
  sensorItem: any,
  page: any,
  setExtlChartDataContainer: any,
  extlId: any,
  extlData: any,
  extlBoundsArray: any,
  countExtl: number
) => {
  const exists = extlChartsAmount.some((secondItemTemp: any) => secondItemTemp.id === sensorItem.id);
  if (!exists) {
    extlId.value++;
    extlChartsAmount.push(sensorItem);
    const bounds: any = new google.maps.LatLngBounds(
      new google.maps.LatLng(sensorItem.lat, sensorItem.lng),
      new google.maps.LatLng(sensorItem.lat + 0.0001, sensorItem.lng + 0.0001)
    )
    if (page === 1) {
      createExtlDataContainer({
        bounds,
        setExtlChartDataContainer,
        extlChartsAmount,
        extlId,
        extlData,
        boundsArray: extlBoundsArray,
        countExtl,
        item: sensorItem
      });
    }
  }
}