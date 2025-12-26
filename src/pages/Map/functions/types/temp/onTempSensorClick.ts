import {getTempMainChartData} from "../../../data/types/temp/getTempMainChartData";

// Интерфейсы для типизации
interface History {
  push: (path: string) => void;
}

interface AdditionalChartData {
  metric: string;
}

interface PresentFunction {
  (options: { message: string; duration?: number; position?: string; color?: string }): void;
}

export const onTempSensorClick = async (
  history: History,
  sensorId: string,
  name: string,
  setChartData: (data: unknown[]) => void,
  setPage: (page: number) => void,
  setSiteId: (id: string | number) => void,
  setSiteName: (name: string) => void,
  setAdditionalChartData: (data: AdditionalChartData) => void,
  setChartPageType: (type: string) => void,
  userId: string | number,
  present: PresentFunction
): Promise<void> => {
  const newChartData = await getTempMainChartData(present, sensorId, userId)
  if (newChartData && newChartData.data) {
    setAdditionalChartData({metric: newChartData.data.metric})
    setChartData(newChartData.data.data)
    setSiteId(sensorId)
    setSiteName(name)
    setChartPageType('temp')
    setPage(2)
    history.push('/AgriNET/chart');
  }
}