import {checkDateValidity} from "../../../checkDateValidity";
import {moistDataBatteryRequest} from "../../../../../../data/types/moist/moistDataBatteryRequest";
import {moistMainChartDataRequest} from "../../../../../../../Map/data/types/moist/moistMainChartDataRequest";
import {createMoistMainChart} from "../../../../../../functions/types/moist/createMoistMainChart";
import {createMoistBatteryChart} from "../../../../../../functions/types/moist/createMoistBatteryChart";
import {moistSumChartDataRequest} from "../../../../../../data/types/moist/sumChartDataRequest";
import {createMoistSumChart} from "../../../../../../functions/types/moist/createMoistSumChart";

export const updateChartWithNewDatetime = async (
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