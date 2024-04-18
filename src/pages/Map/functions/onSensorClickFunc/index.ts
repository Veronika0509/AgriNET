import {chartDataRequest} from "../../data/chartDataRequest";

export const onSensorClick = (id: string, name: string, sensorId: string, setChartData: any, setPage: any, setSiteId: any, setSiteName: any) => {
  if (sensorId !== id) {
    new Promise((resolve: any) => {
      const response = chartDataRequest(id)
      resolve(response)
    }).then((response: any) => {
      setChartData(response.data.data)
      setPage(2)
      setSiteId(id)
      setSiteName(name)
    })
  } else {
    setPage(2)
    setSiteId(id)
    setSiteName(name)
  }
};