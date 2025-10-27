import {getCurrentDatetime} from "./getCurrentDatetime";

export const checkDateValidity = (
  startDate: string | Date,
  endDate: string | Date
): boolean => {
  const startDatetime: number = new Date(new Date(startDate).setHours(0, 0, 0, 0)).getTime()
  const endDatetime: number = new Date(new Date(endDate).setHours(0, 0, 0, 0)).getTime()
  const currentTime = new Date(new Date(getCurrentDatetime()).setHours(0, 0, 0, 0)).getTime()

  return startDatetime > endDatetime || endDatetime > currentTime
}