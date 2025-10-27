// Тип для комментариев
type CommentItemType = 'main' | 'soilTemp' | 'sum' | 'battery';
type SetterFunction = (value: boolean) => void;

export const getSetAddCommentItemShowed = (
  type: CommentItemType,
  setMoistMainAddCommentItemShowed: SetterFunction,
  setMoistSoilTempAddCommentItemShowed: SetterFunction,
  setMoistSumAddCommentItemShowed: SetterFunction,
  setMoistBatteryAddCommentItemShowed: SetterFunction
): SetterFunction | undefined => {
  if (type === 'main') {
    return setMoistMainAddCommentItemShowed
  } else if (type === 'soilTemp') {
    return setMoistSoilTempAddCommentItemShowed
  } else if (type === 'sum') {
    return setMoistSumAddCommentItemShowed
  } else if (type === 'battery') {
    return setMoistBatteryAddCommentItemShowed
  }
  return undefined
}