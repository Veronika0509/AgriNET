import {getCurrentDatetime} from "../getCurrentTime";
import {getDatetime} from "../getDatetime";

export const getStartDate = (props: any) => {
  const date = new Date(props);
  date.setDate(date.getDate() - 14);

  return getDatetime(date)
}