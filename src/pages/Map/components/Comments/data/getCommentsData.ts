import axios, { AxiosResponse } from "axios";
import type { CommentsApiResponse } from "../../../../../types/api";

interface GetCommentsDataParams {
  type: number;
  sort: string;
  startIndex: number;
  userId: number;
  sensorId: string;
}

export const getCommentsData = async (props: GetCommentsDataParams): Promise<AxiosResponse<CommentsApiResponse>> => {
  //sort: any, startIndex: any, , userId: number, sensorId?: any
  const currentYear = new Date().getFullYear();

  let data: any = {
    commentTypeId: props.type,
    sort: props.sort,
    startIndex: props.startIndex,
    year: currentYear,
  }
  props.sensorId.length !== 0 && (data = {...data, sensorId: props.sensorId});
  return await axios.post('https://app.agrinet.us/api/comments/find?v=43', data, {
    headers: {
      "User": props.userId.toString(),
    }
  });
}