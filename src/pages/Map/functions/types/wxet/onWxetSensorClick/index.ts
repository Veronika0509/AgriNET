import {getWxetMainChartData} from "../../../../data/types/wxet/getWxetMainChartData";

export const onWxetSensorClick = async (
  history: any,
  sensorId: string,
  name: string,
  setChartData: any,
  setPage: any,
  setSiteId: any,
  setSiteName: any,
  setAdditionalChartData: any,
  setChartPageType: any
) => {
  const newChartData = await getWxetMainChartData(sensorId)
  setChartData(newChartData.data.data)
  setSiteId(sensorId)
  setSiteName(name)
  setChartPageType('wxet')
  setPage(2)
  setAdditionalChartData({metric: newChartData.data.metric, type: newChartData.data.type})
  history.push('/AgriNET/chart');
}