// Тип для комментариев
type CommentItemType = 'main' | 'soilTemp' | 'sum' | 'battery' | 'temp';
type SetterFunction = (value: boolean) => void;

export const getSetAddCommentItemShowed = (
  type: CommentItemType,
  setMoistMainAddCommentItemShowed: SetterFunction,
  setMoistSoilTempAddCommentItemShowed: SetterFunction,
  setMoistSumAddCommentItemShowed: SetterFunction,
  _setMoistBatteryAddCommentItemShowed: SetterFunction
): ((item: string) => void) | undefined => {
  if (type === 'main') {
    return (_item: string) => setMoistMainAddCommentItemShowed(true)
  } else if (type === 'soilTemp') {
    return (_item: string) => setMoistSoilTempAddCommentItemShowed(true)
  } else if (type === 'sum') {
    return (_item: string) => setMoistSumAddCommentItemShowed(true)
  } else if (type === 'battery') {
    return (_item: string) => undefined
  } else if (type === 'temp') {
    return (_item: string) => {} // temp is not used in moist charts, return noop
  }
  return undefined
}