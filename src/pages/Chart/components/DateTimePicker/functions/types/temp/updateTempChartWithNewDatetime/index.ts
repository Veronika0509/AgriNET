import {checkDateValidity} from "../../../checkDateValidity";
import {tempMainChartDataRequest} from "../../../../../../../Map/data/types/temp/tempMainChartDataRequest";
import {createTempChart} from "../../../../../../functions/types/temp/createTempChart";

export const updateTempChartWithNewDatetime = async (
  startDate: any,
  endDate: any,
  presentToast: any,
  setCurrentDates: any
) => {
  if (checkDateValidity(startDate, endDate)) {
    presentToast()
  } else {
    const endDateDays = endDate.slice(0, 10)
    const startDatetime = new Date(startDate).getTime()
    const endDatetime = new Date(endDate).getTime()
    const days = Math.round((endDatetime - startDatetime) / 86400000)
    setCurrentDates([days, endDateDays, startDatetime, endDatetime])
  }
}