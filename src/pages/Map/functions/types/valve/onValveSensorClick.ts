import {getValvetData} from "../../../data/types/valve/getValvetData";

export const onValveSensorClick = async (
  history: any,
  userId: any,
  sensorId: string,
  name: string,
  setChartData: any,
  setPage: any,
  setSiteId: any,
  setSiteName: any,
  setChartPageType: any
) => {
  const newValveChartData = await getValvetData(sensorId, userId)
  setChartData(newValveChartData.data)
  setSiteId(sensorId)
  setSiteName(name)
  setChartPageType('valve')
  setPage(2)
  history.push('/AgriNET/chart');
};