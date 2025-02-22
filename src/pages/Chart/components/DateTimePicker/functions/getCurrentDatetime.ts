import {getDatetime} from "./getDatetime";

export const getCurrentDatetime = () => {
  const now = new Date();
  return getDatetime(now)
}