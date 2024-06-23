import {wxetMainChartDataRequest} from "../../../../data/types/wxet/wxetMainChartDataRequest";

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
  const newChartData = await wxetMainChartDataRequest(sensorId)
  setChartData(newChartData.data.data)
  setSiteId(sensorId)
  setSiteName(name)
  setChartPageType('wxet')
  setPage(2)
  setAdditionalChartData({metric: newChartData.data.metric, type: newChartData.data.type})
  history.push('/AgriNET/chart');
}