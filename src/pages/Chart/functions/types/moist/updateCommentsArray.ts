import {getComments} from "../../../components/AddComment/data/getComments";
import {getDaysFromChartData} from "../../getDaysFromChartData";
import { SensorId } from '../../../../../types';

// Типы для комментариев
type CommentType = 'M' | 'MSum' | 'MST' | 'battery';
type UpdateCommentsFunction = (type: string, data: unknown) => void;

export const updateCommentsArray = async (
  type: CommentType,
  sensorId: SensorId,
  updateComments: UpdateCommentsFunction,
  data: unknown[]
): Promise<void> => {
  const newComments = await getComments(type, sensorId, getDaysFromChartData(data as any))
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