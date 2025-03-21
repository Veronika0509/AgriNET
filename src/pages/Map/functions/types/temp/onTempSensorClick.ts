import {getTempMainChartData} from "../../../data/types/temp/getTempMainChartData";

export const onTempSensorClick = async (
  history: any,
  sensorId: any,
  name: any,
  setChartData: any,
  setPage: any,
  setSiteId: any,
  setSiteName: any,
  setAdditionalChartData: any,
  setChartPageType: any,
  userId: any,
  present: any
) => {
  const newChartData: any = await getTempMainChartData(present, sensorId, userId)
  setAdditionalChartData({metric: newChartData.data.metric})
  setChartData(newChartData.data.data)
  setSiteId(sensorId)
  setSiteName(name)
  setChartPageType('temp')
  setPage(2)
  history.push('/AgriNET/chart');
}