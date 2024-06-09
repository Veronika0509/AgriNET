import {getMoistChartData} from "../../../../data/types/moisture/getMoistChartData";
import {getSensorItems} from "../../../../data/getSensorItems";
import {getWxetChartData} from "../../../../data/types/wxet/getWxetChartData";

export const onWxetSensorClick = async (
  history: any,
  sensorId: string,
  name: string,
  setChartData: any,
  setPage: any,
  setSiteId: any,
  setSiteName: any,
  setAdditionalChartData: any,
  setChartPageType: any,
  userId: any
) => {
  new Promise((resolve: any) => {
    resolve(getWxetChartData(sensorId, userId))
  }).then((response: any) => {
    console.log(response)
    setChartData(response.data.data)
    setSiteId(sensorId)
    setSiteName(name)
    setChartPageType('wxet')
    setPage(2)
    setAdditionalChartData({metric: response.data.metric, type: response.data.type})
    history.push('/AgriNET/chart');
  })
}