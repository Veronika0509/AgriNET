// Тип для комментариев
type CommentItemType = 'main' | 'soilTemp' | 'sum' | 'battery' | 'temp';
type SetterFunction = (value: boolean) => void;

export const getSetAddCommentItemShowed = (
  type: CommentItemType,
  setMoistMainAddCommentItemShowed: SetterFunction,
  setMoistSoilTempAddCommentItemShowed: SetterFunction,
  setMoistSumAddCommentItemShowed: SetterFunction,
  setMoistBatteryAddCommentItemShowed: SetterFunction
): ((item: string) => void) | undefined => {
  if (type === 'main') {
    return (item: string) => setMoistMainAddCommentItemShowed(true)
  } else if (type === 'soilTemp') {
    return (item: string) => setMoistSoilTempAddCommentItemShowed(true)
  } else if (type === 'sum') {
    return (item: string) => setMoistSumAddCommentItemShowed(true)
  } else if (type === 'battery') {
    return (item: string) => setMoistBatteryAddCommentItemShowed(true)
  } else if (type === 'temp') {
    return (item: string) => {} // temp is not used in moist charts, return noop
  }
  return undefined
}