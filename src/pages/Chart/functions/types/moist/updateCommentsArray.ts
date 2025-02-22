import {getComments} from "../../../components/AddComment/data/getComments";

export const updateCommentsArray = async (
  type: string,
  sensorId: any,
  setMoistMainComments: any,
  setMoistSumComments: any,
  setMoistSoilTempComments: any,
  setMoistBatteryComments: any
) => {
  const newComments: any = await getComments(type, sensorId)
  if (type === 'M') {
    setMoistMainComments(newComments.data)
  } else if (type === 'MSum') {
    setMoistSumComments(newComments.data)
  } else if (type === 'MST') {
    setMoistSoilTempComments(newComments.data)
  } else {
    setMoistBatteryComments(newComments.data)
  }
}