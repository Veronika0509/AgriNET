import {createWxetDataContainers} from "./createWxetDataContainers";
import axios, { AxiosResponse } from "axios";

// Интерфейсы для типизации
interface SensorItem {
  id: string | number;
  sensorId: string | number;
  mainId: string | number;
  markerType: string;
  lat: number;
  lng: number;
  name: string;
  [key: string]: unknown;
}

interface WxetDataItem {
  mainId: string | number;
  id: string | number;
  sensorId: string | number;
  name: string;
  data: {
    temp?: number | null;
    freshness?: string;
    data?: unknown[];
    [key: string]: unknown;
  };
  layerName: string;
  freshness?: string | undefined;
  markerType: string;
  [key: string]: unknown;
}

interface WxetBounds {
  [key: string]: unknown;
}

interface IdCounter {
  value: number;
}



export const createWxetMarker = async (
  wxetChartsAmount: SensorItem[],
  sensorItem: SensorItem,
  page: number,
  userId: string | number,
  setInvalidWxetChartDataContainer: (data: Array<[WxetDataItem, WxetBounds]>) => void,
  setWxetChartDataContainer: (data: Array<[WxetDataItem, WxetBounds]>) => void,
  wxetId: IdCounter,
  wxetData: WxetDataItem[],
  wxetBoundsArray: WxetBounds[],
  wxetInvalidChartData: Array<[WxetDataItem, WxetBounds]>,
  countWxet: number
): Promise<void> => {
  const exists = wxetChartsAmount.some((secondItemTemp: SensorItem) => secondItemTemp.id === sensorItem.id);
  if (!exists) {
    let response: AxiosResponse<{ temp?: number | null; freshness?: string; data?: unknown[]; [key: string]: unknown; }> | undefined = undefined
    if (sensorItem.markerType === 'fuel') {
      response = await axios.get('https://app.agrinet.us/api/chart/fuel?v=43', {
        params: {
          sensorId: sensorItem.sensorId,
          cacheFirst: true,
          'do-not-catch-error': '',
          user: userId,
        }
      })
    } else if (sensorItem.markerType === 'wxet') {
      response = await axios.get('https://app.agrinet.us/api/map/wx?v=43', {
        params: {
          sensorId: sensorItem.sensorId,
          cacheFirst: true,
          'do-not-catch-error': '',
          user: userId,
        }
      })
    }

    wxetId.value++;
    wxetChartsAmount.push(sensorItem);
    const bounds: WxetBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(sensorItem.lat, sensorItem.lng),
      new google.maps.LatLng(sensorItem.lat + 0.0001, sensorItem.lng + 0.0001)
    ) as unknown as WxetBounds
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
        response: response!,
        countWxet,
        markerType: sensorItem.markerType
      });
    }
  }
}