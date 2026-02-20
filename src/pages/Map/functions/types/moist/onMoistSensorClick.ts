import {getMoistMainChartData} from "../../../data/types/moist/getMoistMainChartData";
import {getSensorItems} from "../../../data/getSensorItems";

export const onMoistSensorClick = async (
  history: any,
  sensorId: string,
  mainId: any,
  name: string,
  setChartData: any,
  setPage: any,
  setSiteId: any,
  setSiteName: any,
  setAdditionalChartData: any,
  siteList: any,
  setChartPageType: any
) => {
  // if (sensorId !== id) {
  const newMoistChartData = await getMoistMainChartData(sensorId, false)
  getSensorItems('moist-fuel', siteList).map((sensorItem: any) => {
    if (sensorItem.id === mainId) {
      setAdditionalChartData({linesCount: sensorItem.sensorCount, legend: newMoistChartData.data.legend})
    }
  })
  setChartData(newMoistChartData.data.data)
  setSiteId(sensorId)
  setSiteName(name)
  setChartPageType('moist')
  setPage(2)
  // } else {
  //   setSiteId(id)
  //   setSiteName(name)
  //   setPage(2)
  //   history.push('/AgriNET/chart');
  // }
};