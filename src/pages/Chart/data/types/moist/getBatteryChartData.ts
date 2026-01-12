import axios from "axios";

// Типы для данных от сервера
interface BatteryServerDataItem {
  time: string;
  value: number;
}

// Типы для трансформированных данных
interface BatteryChartDataItem {
  DateTime: string;
  value: number;
}

interface BatteryChartData {
  data: BatteryChartDataItem[];
}

interface BatteryChartResponse {
  data: BatteryChartData;
  status?: number;
}

export const getBatteryChartData = async (
  sensorId: string,
  daysProps?: number,
  endDate?: string
): Promise<BatteryChartResponse> => {
  const response = daysProps && endDate
    ? await axios.get<BatteryServerDataItem[]>('https://app.agrinet.us/api/chart/moisture-battery?v=43', {
        params: {
          sensorId: sensorId,
          days: daysProps,
          endDate: endDate
        }
      })
    : await axios.get<BatteryServerDataItem[]>('https://app.agrinet.us/api/chart/moisture-battery?v=43', {
        params: {
          sensorId: sensorId,
          days: 14
        }
      });

  // Трансформируем данные: преобразуем time -> DateTime
  const transformedData: BatteryChartDataItem[] = response.data.map(item => ({
    DateTime: item.time,
    value: item.value
  }));

  return {
    data: {
      data: transformedData
    },
    status: response.status
  };
}