import {getDatetime} from "./getDatetime";

export const getCurrentDatetime = () => {
  const now = new Date();
  now.setDate(now.getDate() + 1)
  return getDatetime(now);
}