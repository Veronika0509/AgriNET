export const getSetAddCommentItemShowed = (
  type: string,
  setMoistMainAddCommentItemShowed: any,
  setMoistSoilTempAddCommentItemShowed: any,
  setMoistSumAddCommentItemShowed: any,
  setMoistBatteryAddCommentItemShowed: any
) => {
  if (type === 'main') {
    return setMoistMainAddCommentItemShowed
  } else if (type === 'soilTemp') {
    return setMoistSoilTempAddCommentItemShowed
  } else if (type === 'sum') {
    return setMoistSumAddCommentItemShowed
  } else if (type === 'battery') {
    return setMoistBatteryAddCommentItemShowed
  }
}