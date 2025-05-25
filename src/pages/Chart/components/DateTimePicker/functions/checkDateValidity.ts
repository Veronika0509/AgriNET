import {getCurrentDatetime} from "./getCurrentDatetime";

export const checkDateValidity = (startDate: any, endDate: any) => {
  const startDatetime: any = new Date(new Date(startDate).setHours(0, 0, 0, 0)).getTime()
  const endDatetime: any = new Date(new Date(endDate).setHours(0, 0, 0, 0)).getTime()
  const currentTime = new Date(new Date(getCurrentDatetime()).setHours(0, 0, 0, 0)).getTime()

  return startDatetime > endDatetime || endDatetime > currentTime
}