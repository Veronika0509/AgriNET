// Тип для комментариев
type CommentItemType = 'main' | 'soilTemp' | 'sum' | 'battery';

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
  }
  return undefined
}