import {checkDateValidity} from "./checkDateValidity";
import {updateChartWithNewDates} from "../../../functions/types/moist/updateChartWithNewDates";

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
  updateChart: any
) => {
  if (selectedTab === 'years') {
    updateChartWithNewDates(startDate, endDate, setCurrentDates, fullDatesArray, setDisableNextButton, setDisablePrevButton, setShowForecast, updateChart)
  } else {
    if (checkDateValidity(startDate, endDate)) {
      presentToast()
    } else {
      updateChartWithNewDates(startDate, endDate, setCurrentDates, fullDatesArray, setDisableNextButton, setDisablePrevButton, setShowForecast, updateChart)
    }
  }
}