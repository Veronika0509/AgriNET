import {getWxetMainChartData} from "../../../data/types/wxet/getWxetMainChartData";

interface History {
  push: (path: string) => void;
}

export const onWxetSensorClick = async (
  history: History,
  sensorId: string,
  name: string,
  setChartData: (data: unknown) => void,
  setPage: (page: number) => void,
  setSiteId: (id: string | number) => void,
  setSiteName: (name: string) => void,
  setAdditionalChartData: (data: { metric: unknown; type: unknown }) => void,
  setChartPageType: (type: string) => void
): Promise<void> => {
  const newChartData = await getWxetMainChartData(sensorId)
  setChartData(newChartData.data.data)
  setSiteId(sensorId)
  setSiteName(name)
  setChartPageType('wxet')
  setPage(2)
  setAdditionalChartData({metric: newChartData.data.metric, type: newChartData.data.type})
  history.push('/AgriNET/chart');
}