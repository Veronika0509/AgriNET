import {getValveData} from "../../../data/types/valve/getValveData";

interface History {
  push: (path: string) => void;
}

export const onValveSensorClick = async (
  history: History,
  userId: string | number,
  sensorId: string,
  name: string,
  setChartData: (data: unknown) => void,
  setPage: (page: number) => void,
  setSiteId: (id: string) => void,
  setSiteName: (name: string) => void,
  setChartPageType: (type: string) => void
) => {
  const newValveChartData = await getValveData(sensorId, userId)
  setChartData(newValveChartData.data)
  setSiteId(sensorId)
  setSiteName(name)
  setChartPageType('valve')
  setPage(2)
};