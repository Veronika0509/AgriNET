import {getCurrentDatetime} from "./getCurrentDatetime";

export const checkDateValidity = (startDate: any, endDate: any) => {
  const startDatetime: any = new Date(startDate).getTime()
  const endDatetime: any = new Date(endDate).getTime()
  const currentTime = new Date(getCurrentDatetime()).getTime()

  return startDatetime > endDatetime || endDatetime > currentTime
}