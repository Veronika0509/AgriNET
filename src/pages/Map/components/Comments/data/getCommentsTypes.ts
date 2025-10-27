import axios, { AxiosResponse } from "axios";
import { CommentTypesResponse } from "@/types/comments";

export const getCommentsTypes = async (): Promise<AxiosResponse<CommentTypesResponse>> => {
  return await axios.get<CommentTypesResponse>('https://app.agrinet.us/api/comments/types?v=43');
}