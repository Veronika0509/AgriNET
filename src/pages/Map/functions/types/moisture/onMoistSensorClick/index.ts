import {getMoistChartData} from "../../../../data/types/moisture/getMoistChartData";
import {getSensorItems} from "../../../../data/getSensorItems";

export const onMoistSensorClick = (
  history: any,
  id: string,
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
    new Promise((resolve: any) => {
      const response = getMoistChartData(id)
      resolve(response)
    }).then((response: any) => {
      getSensorItems('moist-fuel', siteList).map((sensorItem: any) => {
        if (sensorItem.sensorId === id) {
          setAdditionalChartData({linesCount: sensorItem.sensorCount})
        }
      })
      setChartData(response.data.data)
      setSiteId(id)
      setSiteName(name)
      setChartPageType('moistFuel')
      setPage(2)
      history.push('/AgriNET/chart');
    })
  // } else {
  //   setSiteId(id)
  //   setSiteName(name)
  //   setPage(2)
  //   history.push('/AgriNET/chart');
  // }
};