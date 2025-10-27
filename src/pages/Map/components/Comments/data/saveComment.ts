import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import type { 
  ApiResponse, 
  SaveCommentResponse,
  SaveCommentParams as SaveCommentParamsType,
  RequestConfig
} from "@/types/comments";

/**
 * Custom error class for comment saving errors
 */
class CommentSaveError extends Error {
  constructor(
    message: string, 
    public readonly status?: number, 
    public readonly code?: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CommentSaveError';
    Object.setPrototypeOf(this, CommentSaveError.prototype);
  }
}

/**
 * Extended request configuration with custom options
 */
interface SaveCommentRequestConfig extends AxiosRequestConfig, RequestConfig {}

/**
 * Request interface for saving a comment
 */
interface SaveCommentRequest {
  id?: number;
  chartKind: string;
  sensorId: string;
  type: number;
  field: string;
  date: string;
  text: string;
  userId: string;
  opts?: {
    userId: string;
    cssClass?: string;
    showBackdrop?: boolean;
    enableBackdropDismiss?: boolean;
  };
}

/**
 * Validates the input parameters for the saveComment function
 * @param params The parameters to validate
 * @throws {CommentSaveError} If validation fails
 */
function validateSaveParams(params: unknown): asserts params is SaveCommentRequest {
  if (!params || typeof params !== 'object') {
    throw new CommentSaveError('Invalid parameters: params must be an object', 400, 'INVALID_PARAMS');
  }

  const requiredFields = ['chartKind', 'sensorId', 'type', 'field', 'date', 'text', 'userId'] as const;
  const missingFields = requiredFields.filter(field => !(field in (params as Record<string, unknown>)));
  
  if (missingFields.length > 0) {
    throw new CommentSaveError(
      `Missing required fields: ${missingFields.join(', ')}`,
      400,
      'MISSING_REQUIRED_FIELDS',
      { missingFields }
    );
  }
}

/**
 * Saves a comment to the server with enhanced type safety and error handling
 * 
 * @param params - The comment data to save
 * @param config - Optional request configuration
 * @returns A promise that resolves to the server response
 * @throws {CommentSaveError} If the request fails or the response is invalid
 * 
 * @example
 * ```typescript
 * try {
 *   const response = await saveComment({
 *     chartKind: 'temperature',
 *     sensorId: 'sensor123',
 *     type: 1,
 *     field: 'Field A',
 *     date: '2024-03-20',
 *     text: 'Test comment',
 *     userId: 'user123'
 *   });
 *   console.log('Comment saved:', response.data);
 * } catch (error) {
 *   if (error instanceof CommentSaveError) {
 *     console.error(`Save failed (${error.status}): ${error.message}`);
 *   } else {
 *     console.error('Unexpected error:', error);
 *   }
 * }
 * ```
 */
export const saveComment = async (
  params: SaveCommentParamsType,
  config: Partial<SaveCommentRequestConfig> = {}
): Promise<AxiosResponse<ApiResponse<SaveCommentResponse>>> => {
  // Validate input parameters
  validateSaveParams(params);

  // Prepare request data with proper type conversion and defaults
  const requestData: SaveCommentRequest = {
    ...(params.id !== undefined && { id: params.id }),
    chartKind: params.chartKind,
    sensorId: params.sensorId,
    type: typeof params.type === 'string' ? parseInt(params.type, 10) : params.type,
    field: params.field,
    date: params.date,
    text: params.text,
    userId: params.userId,
    ...(params.opts && { 
      opts: {
        // Default options
        cssClass: 'edit-comment',
        showBackdrop: true,
        enableBackdropDismiss: true,
        // Apply user ID and merge with provided options (overriding defaults if needed)
        ...params.opts,
        // Ensure userId is always set to the current user
        userId: params.userId
      } 
    })
  };

  // Configure request with defaults and overrides
  const requestConfig: SaveCommentRequestConfig = {
    method: 'POST',
    url: '/api/comments/save',
    headers: {
      'Content-Type': 'application/json',
      ...(config.headers || {})
    },
    data: requestData,
    validateStatus: (status) => status >= 200 && status < 500,
    timeout: 30000, // 30 seconds
    ...config,
    meta: {
      requestId: `comment-save-${Date.now()}`,
      ...(config.meta || {})
    }
  };

  try {
    const response = await axios.request<ApiResponse<SaveCommentResponse>>(requestConfig);
    
    // Validate response structure
    if (!response.data || typeof response.data !== 'object') {
      throw new CommentSaveError(
        'Invalid response format from server', 
        response.status,
        'INVALID_RESPONSE',
        { response: response.data }
      );
    }
    
    // Type guard to check for error response
    const isErrorResponse = (data: unknown): data is { error?: string; code?: string | number } => {
      return typeof data === 'object' && data !== null && 'error' in data;
    };

    // Check for API-level errors
    if (isErrorResponse(response.data)) {
      throw new CommentSaveError(
        response.data.error || 'Failed to save comment',
        response.status,
        response.data.code ? String(response.data.code) : 'SAVE_FAILED',
        { response: response.data }
      );
    }
    
    return response;
  } catch (error) {
    if (error instanceof CommentSaveError) {
      throw error; // Re-throw our custom error
    }
    
    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const responseData = error.response?.data as { message?: string } | undefined;
      const message = responseData?.message || error.message || 'Failed to save comment';
      
      throw new CommentSaveError(
        message,
        status,
        error.code || 'NETWORK_ERROR',
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
    throw new CommentSaveError(
      error instanceof Error ? error.message : 'An unknown error occurred',
      undefined,
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
};

// fetch("https://app.agrinet.us/api/comments/save", {
//     "body": "{\"id\":2192,\"chartKind\":\"MSum\",\"sensorId\":\"ANM00099\",\"field\":\"Meyer Improved Lemon\",\"date\":\"2024-10-09 04:23\",\"type\":null,\"text\":\"321321\",\"opts\":{\"cssClass\":\"edit-comment\",\"showBackdrop\":true,\"enableBackdropDismiss\":true}}",
//     "cache": "default",
//     "credentials": "omit",
//     "headers": {
//         "Accept": "application/json, text/plain, */*",
//         "Accept-Language": "ru",
//         "Content-Type": "application/json",
//         "Priority": "u=3, i",
//         "User": "103",
//         "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
//         "Version": "42.2.1"
//     },
//     "method": "POST",
//     "mode": "cors",
//     "redirect": "follow",
//     "referrer": "https://app.agrinet.us/",
//     "referrerPolicy": "strict-origin-when-cross-origin"
// })