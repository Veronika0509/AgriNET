import {createMoistDataContainers} from "./createMoistDataContainers";
import axios from "axios";
import {getMoistMarkerChartData} from "../../../data/types/moist/getMoistMarkerChartData";
import {logoFacebook} from "ionicons/icons";

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
  boundsArray: any,
  countMoistFuel: number
) => {
  const exists = moistChartsAmount.some((secondItemMoist: any) => secondItemMoist.id === sensorItem.id);
  if (!exists) {
    const response = await getMoistMarkerChartData(sensorItem.sensorId, userId)
    moistId.value++;
    moistChartsAmount.push(sensorItem);
    const bounds: any = new google.maps.LatLngBounds(
      new google.maps.LatLng(sensorItem.lat, sensorItem.lng),
      new google.maps.LatLng(sensorItem.lat + 0.0001, sensorItem.lng + 0.0001)
    )
    if (page === 1) {
      createMoistDataContainers({
        mainId: sensorItem.id,
        sensorId: sensorItem.sensorId,
        bounds,
        name: sensorItem.name,
        setInvalidMoistChartDataContainer,
        setMoistChartDataContainer,
        moistChartsAmount,
        moistId,
        moistChartData,
        boundsArray,
        invalidChartData: moistInvalidChartData,
        response,
        countMoistFuel
      });
    }
  }
}