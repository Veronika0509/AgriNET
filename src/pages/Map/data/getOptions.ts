import axios, { AxiosResponse } from "axios";
import type { OptionsApiResponse } from "../../../types/api";

export const getOptions = async (): Promise<AxiosResponse<OptionsApiResponse>> => {
  return await axios.get<OptionsApiResponse>('https://app.agrinet.us/api/options?v=43');
}