// Тип для комментариев
type CommentItemType = 'main' | 'soilTemp' | 'sum' | 'battery' | 'temp';

export const getAddCommentItemShowed = (
  type: CommentItemType,
  moistMainAddCommentItemShowed: boolean,
  moistSoilTempAddCommentItemShowed: boolean,
  moistSumAddCommentItemShowed: boolean,
  moistBatteryAddCommentItemShowed: boolean
): boolean | undefined => {
  if (type === 'main') {
    return moistMainAddCommentItemShowed
  } else if (type === 'soilTemp') {
    return moistSoilTempAddCommentItemShowed
  } else if (type === 'sum') {
    return moistSumAddCommentItemShowed
  } else if (type === 'battery') {
    return moistBatteryAddCommentItemShowed
  } else if (type === 'temp') {
    return false // temp is not used in moist charts
  }
  return undefined
}