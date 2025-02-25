import {checkDateValidity} from "./checkDateValidity";
import {updateMoistChartWithNewDates} from "../../../functions/types/moist/updateMoistChartWithNewDates";

export const updateChartsWithNewDatetime = async (
  startDate: any,
  endDate: any,
  selectedTab: any,
  presentToast: any,
  setCurrentDates: any,
  fullDatesArray: any,
  setDisableNextButton: any,
  setDisablePrevButton: any,
  setShowForecast: any,
  updateChart: any,
  dateDifferenceInDays: any,
  type: string
) => {
  if (type === 'moist') {
    if (selectedTab === 'years') {
      const newEndDate = new Date().setHours(0, 0, 0, 0)
      const newStartDate = new Date(newEndDate - ((365 * dateDifferenceInDays) * 24 * 60 * 60 * 1000))
      updateMoistChartWithNewDates(newStartDate, newEndDate, setCurrentDates, fullDatesArray, setDisableNextButton, setDisablePrevButton, setShowForecast, updateChart)
    } else {
      if (checkDateValidity(startDate, endDate)) {
        presentToast()
      } else {
        updateMoistChartWithNewDates(startDate, endDate, setCurrentDates, fullDatesArray, setDisableNextButton, setDisablePrevButton, setShowForecast, updateChart)
      }
    }
  } else if (type === 'wxet' || type === 'temp') {
    if (selectedTab === 'years') {
      const newEndDate = new Date().setHours(0, 0, 0, 0)
      const newStartDate = new Date(newEndDate - ((365 * dateDifferenceInDays) * 24 * 60 * 60 * 1000))

      setCurrentDates([newStartDate, newEndDate])
    } else {
      if (checkDateValidity(startDate, endDate)) {
        presentToast()
      } else {
        setCurrentDates([startDate, endDate])
      }
    }
  }
}