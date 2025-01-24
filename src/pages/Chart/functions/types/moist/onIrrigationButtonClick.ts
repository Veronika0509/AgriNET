import {getDatetime} from "../../../components/DateTimePicker/functions/getDatetime";

export const onIrrigationButtonClick = async (
  buttonProps: number,
  currentChartData: any,
  irrigationDates: any,
  setDisableNextButton: any,
  setDisablePrevButton: any,
  disableNextButton: any,
  disablePrevButton: any,
  setStartDate: any,
  setEndDate: any,
  setCurrentDates: any
) => {
  let currentDate: any

  if (buttonProps === 1) {
    currentDate = currentChartData[currentChartData.length - 1].DateTime.substring(0, 10)
  } else {
    currentDate = currentChartData[0].DateTime.substring(0, 10)
  }

  function findNearestDate(currentDate: string, dateList: string[]) {
    const currentDateObj = new Date(currentDate);
    const dateObjects = dateList.map(date => new Date(date));
    const validDates = dateObjects.filter(buttonProps === 1 ? date => date > currentDateObj : dateObj => dateObj <= currentDateObj);
    if (buttonProps === 1) {
      const closestDate = new Date(Math.min(...validDates.map(date => date.getTime())));
      closestDate.setDate(closestDate.getDate() + 7);
      return getDatetime(closestDate).split('T')[0];
    } else {
      const nearestDateObj = new Date(Math.max.apply(null, validDates.map(date => date.getTime())));
      nearestDateObj.setDate(nearestDateObj.getDate() + 7);
      return getDatetime(nearestDateObj).split('T')[0];
    }
  }

  const nearestDate = new Date(findNearestDate(currentDate, irrigationDates))
  nearestDate.setDate(nearestDate.getDate() - 7);
  const year = nearestDate.getFullYear();
  const month = (nearestDate.getMonth() + 1).toString().padStart(2, '0');
  const day = nearestDate.getDate().toString().padStart(2, '0');
  const formattedNearestDate = `${year}-${month}-${day}`;

  if (formattedNearestDate === irrigationDates[0]) {
    setDisableNextButton(true)
  }
  if (formattedNearestDate === irrigationDates[irrigationDates.length - 1]) {
    setDisablePrevButton(true)
  }
  if (formattedNearestDate !== irrigationDates[0]) {
    if (disableNextButton) {
      setDisableNextButton(false)
    }
  }
  if (formattedNearestDate !== irrigationDates[irrigationDates.length - 1]) {
    if (disablePrevButton) {
      setDisablePrevButton(false)
    }
  }

  setCurrentDates([14, findNearestDate(currentDate, irrigationDates), formattedNearestDate, formattedNearestDate])

  const endDateTimeDefault = new Date(findNearestDate(currentDate, irrigationDates))
  const endDatetime = getDatetime(new Date(endDateTimeDefault.setDate(endDateTimeDefault.getDate() - 1)))
  setEndDate(endDatetime)

  const startDatetime = new Date(endDatetime)
  setStartDate(getDatetime(new Date(startDatetime.setDate(startDatetime.getDate() - 14))))
}