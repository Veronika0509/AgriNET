import {getComments} from "../../../components/AddComment/data/getComments";
import {getDaysFromChartData} from "../../getDaysFromChartData";

export const updateCommentsArray = async (
  type: string,
  sensorId: any,
  updateComments: any,
  data: any
) => {
  const newComments: any = await getComments(type, sensorId, getDaysFromChartData(data))
  if (type === 'M') {
    updateComments('main', newComments.data)
  } else if (type === 'MSum') {
    updateComments('sum', newComments.data)
  } else if (type === 'MST') {
    updateComments('soilTemp', newComments.data)
  } else {
    updateComments('battery', newComments.data)
  }
}