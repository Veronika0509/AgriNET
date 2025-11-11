import {createTempDataContainers} from "./createTempDataContainers";
import axios from "axios";

// Интерфейсы для типизации
interface SensorItem {
  id: string | number;
  sensorId: string | number;
  mainId: string | number;
  lat: number;
  lng: number;
  name: string;
  [key: string]: unknown;
}

interface TempChartDataItem {
  id: string;
  mainId: string | number;
  sensorId: string | number;
  name: string;
  layerName: string;
  bgColor: string;
  lines: string[];
  line1Color: string;
  line2Color: string;
  chartValue: string;
  batteryPercentage: number;
  metric: string;
  temp: number;
  data: unknown[];
  freshness: string;
  alarmEnabled: boolean;
  [key: string]: unknown;
}

interface TempBounds {
  [key: string]: unknown;
}

interface IdCounter {
  value: number;
}

export const createTempMarker = async (
  tempChartsAmount: SensorItem[],
  sensorItem: SensorItem,
  page: number,
  userId: string | number,
  setInvalidTempChartDataContainer: (data: Array<[TempChartDataItem, TempBounds]>) => void,
  setTempChartDataContainer: (data: Array<[TempChartDataItem, TempBounds]>) => void,
  tempId: IdCounter,
  tempChartData: TempChartDataItem[],
  tempBoundsArray: TempBounds[],
  tempInvalidChartData: Array<[TempChartDataItem, TempBounds]>,
  countTemp: number
): Promise<void> => {
  const exists = tempChartsAmount.some((secondItemTemp: SensorItem) => secondItemTemp.id === sensorItem.id);
  if (!exists) {
    const response = await axios.get('https://app.agrinet.us/api/map/temp-data-v2?v=43', {
      params: {
        sensorId: sensorItem.sensorId,
        userId: userId,
        'do-not-catch-error': ''
      },
    })
    tempId.value++;
    tempChartsAmount.push(sensorItem);
    const bounds: TempBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(sensorItem.lat, sensorItem.lng),
      new google.maps.LatLng(sensorItem.lat + 0.0001, sensorItem.lng + 0.0001)
    ) as unknown as TempBounds
    if (page === 1) {
      createTempDataContainers({
        mainId: sensorItem.id,
        sensorId: sensorItem.sensorId,
        bounds,
        name: sensorItem.name,
        tempChartsAmount,
        setInvalidTempChartDataContainer,
        setTempChartDataContainer,
        id: tempId,
        tempChartData,
        boundsArray: tempBoundsArray,
        invalidChartData: tempInvalidChartData,
        response,
        countTemp
      })
    }
  }
}