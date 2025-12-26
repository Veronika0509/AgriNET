import {checkDateValidity} from "./checkDateValidity";
import {updateMoistChartWithNewDates} from "../../../functions/types/moist/updateMoistChartWithNewDates";

export const updateChartsWithNewDatetime = async (
  startDate: any,
  endDate: any,
  selectedTab: any,
  presentToast: any,
  setCurrentDates: any,
  setShowForecast: any,
  updateChart: any,
  dateDifferenceInDays: any,
  type: string
) => {
  if (type === 'moist') {
    if (selectedTab === 'years') {
      const endDate = new Date()
      endDate.setHours(0, 0, 0, 0)
      const startDate = new Date(endDate.getTime() - ((365 * dateDifferenceInDays) * 24 * 60 * 60 * 1000))
      updateMoistChartWithNewDates(startDate, endDate, setCurrentDates, setShowForecast, updateChart)
    } else {
      if (checkDateValidity(startDate, endDate)) {
        presentToast()
      } else {
        updateMoistChartWithNewDates(startDate, endDate, setCurrentDates, setShowForecast, updateChart)
      }
    }
  } else if (type === 'wxet' || type === 'temp' || type === 'fuel') {
    if (selectedTab === 'years') {
      const endDate = new Date()
      endDate.setHours(0, 0, 0, 0)
      const startDate = new Date(endDate.getTime() - ((365 * dateDifferenceInDays) * 24 * 60 * 60 * 1000))

      setCurrentDates([startDate, endDate])
    } else {
      if (checkDateValidity(startDate, endDate)) {
        presentToast()
      } else {
        setCurrentDates([startDate, endDate])
      }
    }
  }
}