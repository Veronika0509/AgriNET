import {getFuelMainChartData} from "../../../data/types/wxet/getFuelMainChartData";

interface History {
  push: (path: string) => void;
}

export const onFuelSensorClick = async (
  history: History,
  sensorId: string,
  name: string,
  setChartData: (data: unknown) => void,
  setPage: (page: number) => void,
  setSiteId: (id: string | number) => void,
  setSiteName: (name: string) => void,
  // setAdditionalChartData: (data: unknown) => void,
  setChartPageType: (type: string) => void
): Promise<void> => {
  const newChartData = await getFuelMainChartData(sensorId)
  setChartData(newChartData.data.data)
  setSiteId(sensorId)
  setSiteName(name)
  setChartPageType('fuel')
  setPage(2)
  // setAdditionalChartData({metric: newChartData.data.metric, type: newChartData.data.type})
  history.push('/AgriNET/chart');
}