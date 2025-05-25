import {getFuelMainChartData} from "../../../data/types/wxet/getFuelMainChartData";

export const onFuelSensorClick = async (
  history: any,
  sensorId: string,
  name: string,
  setChartData: any,
  setPage: any,
  setSiteId: any,
  setSiteName: any,
  // setAdditionalChartData: any,
  setChartPageType: any
) => {
  const newChartData = await getFuelMainChartData(sensorId)
  setChartData(newChartData.data.data)
  setSiteId(sensorId)
  setSiteName(name)
  setChartPageType('fuel')
  setPage(2)
  // setAdditionalChartData({metric: newChartData.data.metric, type: newChartData.data.type})
  history.push('/AgriNET/chart');
}