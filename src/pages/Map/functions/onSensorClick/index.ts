import {chartDataRequest} from "../../data/chartDataRequest";

export const onSensorClick = (history: any, id: string, name: string, sensorId: string, setChartData: any, setPage: any, setSiteId: any, setSiteName: any) => {
  if (sensorId !== id) {
    new Promise((resolve: any) => {
      const response = chartDataRequest(id)
      resolve(response)
    }).then((response: any) => {
      setChartData(response.data.data)
      setSiteId(id)
      setSiteName(name)
      setPage(2)
      history.push('/AgriNET/chart');
    })
  } else {
    setSiteId(id)
    setSiteName(name)
    setPage(2)
    history.push('/AgriNET/chart');
  }
};