import {chartDataRequest} from "../../../../data/types/moisture/chartDataRequest";
import {getSensorItems} from "../../../../data/getSensorItems";

export const onMoistSensorClick = (history: any, id: string, name: string,  setChartData: any, setPage: any, setSiteId: any, setSiteName: any, setLinesCount: any, siteList: any) => {
  // if (sensorId !== id) {
    new Promise((resolve: any) => {
      const response = chartDataRequest(id)
      resolve(response)
    }).then((response: any) => {
      setChartData(response.data.data)
      getSensorItems('moist-fuel', siteList).map((sensorItem: any) => {
        if (sensorItem.sensorId === id) {
          setLinesCount(sensorItem.sensorCount)
        }
      })
      setSiteId(id)
      setSiteName(name)
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