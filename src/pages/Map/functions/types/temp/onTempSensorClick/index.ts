import {getSensorItems} from "../../../../data/getSensorItems";
import {tempMainChartDataRequest} from "../../../../data/types/temp/tempMainChartDataRequest";

export const onTempSensorClick = async (
  history: any,
  sensorId: any,
  name: any,
  setChartData: any,
  setPage: any,
  setSiteId: any,
  setSiteName: any,
  setAdditionalChartData: any,
  siteList: any,
  setChartPageType: any
) => {
  const newChartData = await tempMainChartDataRequest(sensorId)
  // getSensorItems('moist-fuel', siteList).map((sensorItem: any) => {
  //   if (sensorItem.sensorId === sensorId) {
  //     setAdditionalChartData({linesCount: sensorItem.sensorCount})
  //   }
  // })
  // setChartData(newChartData.data.data)
  // setSiteId(sensorId)
  // setSiteName(name)
  // setChartPageType('moist')
  // setPage(2)
  // history.push('/AgriNET/chart');
}