import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { 
  CommentsResponse,
  GetCommentsParams as GetCommentsParamsType,
  RequestConfig,
  CommentSortOption
} from "@/types/comments";

/**
 * Custom error class for comments API errors
 */
class CommentsApiError extends Error {
  constructor(
    message: string, 
    public readonly status?: number, 
    public readonly code?: string | number, 
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CommentsApiError';
    Object.setPrototypeOf(this, CommentsApiError.prototype);
  }
}

/**
 * Request interface for getting comments
 */
interface GetCommentsRequest {
  commentTypeId: number;
  sort: 'chartKind' | 'type' | 'dateDesc' | 'dateAsc';
  startIndex: number;
  sensorId?: string;
}

/**
 * Extended request configuration with custom options
 */
interface CommentsRequestConfig extends AxiosRequestConfig, RequestConfig {}

/**
 * Validates the input parameters for the getCommentsData function
 * @param params The parameters to validate
 * @throws {CommentsApiError} If validation fails
 */
function validateParams(params: unknown): asserts params is GetCommentsParamsType {
  if (!params || typeof params !== 'object') {
    throw new CommentsApiError('Invalid parameters: params must be an object', 400, 'INVALID_PARAMS');
  }

  const { type, userId } = params as Partial<GetCommentsParamsType>;
  
  if (type == null) {
    throw new CommentsApiError('Missing required parameter: type', 400, 'MISSING_TYPE');
  }
  
  if (!userId) {
    throw new CommentsApiError('Missing required parameter: userId', 400, 'MISSING_USER_ID');
  }

  if (typeof type !== 'number' || isNaN(type)) {
    throw new CommentsApiError('Invalid parameter: type must be a number', 400, 'INVALID_TYPE');
  }
}

/**
 * Normalizes the sort parameter to ensure it matches the expected format
 */
function normalizeSortOption(sort?: CommentSortOption): 'chartKind' | 'type' | 'dateDesc' | 'dateAsc' {
  switch (sort) {
    case 'chartKind':
    case 'type':
    case 'dateDesc':
    case 'dateAsc':
      return sort;
    case 'newest':
      return 'dateDesc';
    case 'oldest':
      return 'dateAsc';
    default:
      return 'dateDesc';
  }
}

/**
 * Fetches comments from the server with enhanced type safety and error handling
 * 
 * @param params - The parameters for fetching comments
 * @param config - Optional request configuration
 * @returns A promise that resolves to the comments data
 * @throws {CommentsApiError} If the request fails or the response is invalid
 * 
 * @example
 * ```typescript
 * try {
 *   const response = await getCommentsData({
 *     type: 1,
 *     userId: 'user123',
 *     sort: 'dateDesc',
 *     startIndex: 0
 *   });
 *   console.log(response.data);
 * } catch (error) {
 *   if (error instanceof CommentsApiError) {
 *     console.error(`API Error (${error.status}): ${error.message}`);
 *   } else {
 *     console.error('Unexpected error:', error);
 *   }
 * }
 * ```
 */
export const getCommentsData = async (
  params: GetCommentsParamsType,
  config: Partial<CommentsRequestConfig> = {}
): Promise<AxiosResponse<CommentsResponse>> => {
  // Validate input parameters
  validateParams(params);

  // Prepare request data with proper type conversion and validation
  const requestData: GetCommentsRequest = {
    commentTypeId: Number(params.type),
    sort: normalizeSortOption(params.sort),
    startIndex: Math.max(0, params.startIndex || 0),
    ...(params.sensorId && params.sensorId.trim() && { 
      sensorId: params.sensorId.trim() 
    })
  };

  // Configure request with defaults and overrides
  const requestConfig: CommentsRequestConfig = {
    method: 'POST',
    url: '/api/comments/find',
    headers: {
      'Content-Type': 'application/json',
      'User': params.userId.toString(),
      ...config.headers
    },
    data: requestData,
    validateStatus: (status) => status >= 200 && status < 500,
    timeout: 30000, // 30 seconds
    ...config,
    meta: {
      requestId: `comment-${Date.now()}`,
      ...(config.meta || {})
    }
  };

  try {
    const response = await axios.post<CommentsResponse>(
      'https://app.agrinet.us/api/comments/find?v=43', 
      requestData,
      config
    );
    
    // Validate response structure
    if (!response.data || typeof response.data !== 'object') {
      throw new CommentsApiError(
        'Invalid response format from server', 
        response.status,
        'INVALID_RESPONSE',
        { response: response.data }
      );
    }

    // Check for API-level errors
    if ('error' in response.data && response.data.error) {
      const errorData = response.data as { error: string; code?: string | number };
      throw new CommentsApiError(
        errorData.error,
        response.status,
        errorData.code?.toString(),
        { 
          response: response.data,
          request: {
            url: requestConfig.url,
            method: requestConfig.method,
            params: requestData
          }
        }
      );
    }

    return response;
  } catch (error) {
    if (error instanceof CommentsApiError) {
      throw error; // Re-throw our custom error
    }

    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const responseData = error.response?.data as { message?: string } | undefined;
      const message = responseData?.message || error.message || 'Unknown error occurred';
      
      throw new CommentsApiError(
        message,
        status,
        error.code || 'API_ERROR',
        {
          request: error.config ? {
            url: error.config.url,
            method: error.config.method,
            data: error.config.data
          } : undefined,
          response: error.response?.data
        }
      );
    }

    // Handle unexpected errors
    throw new CommentsApiError(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500,
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
};
//     "credentials": "omit",
//     "headers": {
//         "Accept": "application/json, text/plain, */*",
//         "Accept-Language": "ru",
//         "Content-Type": "application/json",
//         "Priority": "u=3, i",
//         "User": "103",
//         "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1.1 Safari/605.1.15",
//         "Version": "42.2.1"
//     },
//     "method": "POST",
//     "mode": "cors",
//     "redirect": "follow",
//     "referrer": "http://app.agrinet.us/",
//     "referrerPolicy": "strict-origin-when-cross-origin"
// })