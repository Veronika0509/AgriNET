export const getAddCommentItemShowed = (
  type: string,
  moistMainAddCommentItemShowed: any,
  moistSoilTempAddCommentItemShowed: any,
  moistSumAddCommentItemShowed: any,
  moistBatteryAddCommentItemShowed: any
) => {
  if (type === 'main') {
    return moistMainAddCommentItemShowed
  } else if (type === 'soilTemp') {
    return moistSoilTempAddCommentItemShowed
  } else if (type === 'sum') {
    return moistSumAddCommentItemShowed
  } else if (type === 'battery') {
    return moistBatteryAddCommentItemShowed
  }
}