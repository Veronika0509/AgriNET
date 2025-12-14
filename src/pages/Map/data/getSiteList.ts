import axios, { AxiosResponse } from "axios";
import type { Site } from "../../../types";

interface ApiSuccessResponse {
  data: Site[];
  status: number;
  statusText: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  data: Site[];
  status?: number;
}

export const getSiteList = async (userId: string | number): Promise<ApiSuccessResponse | ErrorResponse> => {
  try {
    const response: AxiosResponse<Site[]> = await axios.get('https://app.agrinet.us/api/map/sites', {
      params: {
        userId: userId,
        _t: Date.now(), // Cache-busting timestamp to ensure fresh data
      },
      timeout: 10000, // 10 second timeout
    });
    return response;
  } catch (error) {
    console.error('Error fetching site list:', error);
    
    // Return a safe error response
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 500) {
        return {
          success: false,
          error: 'Server error. Please try again later or contact support.',
          data: [],
        };
      } else if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: 'Request timeout. Please check your internet connection.',
          data: [],
        };
      } else if (!error.response) {
        return {
          success: false,
          error: 'Network error. Please check your internet connection.',
          data: [],
        };
      }
    }
    
    return {
      success: false,
      error: 'Failed to load sites. Please try again.',
      data: [],
    };
  }
};