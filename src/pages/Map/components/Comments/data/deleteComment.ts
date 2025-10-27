import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import type { 
  ApiResponse, 
  DeleteCommentResponse,
  RequestConfig
} from "@/types/comments";

/**
 * Custom error class for comment deletion errors
 */
class CommentDeletionError extends Error {
  constructor(
    message: string, 
    public readonly status?: number, 
    public readonly code?: string | number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CommentDeletionError';
    Object.setPrototypeOf(this, CommentDeletionError.prototype);
  }
}

/**
 * Extended request configuration with custom options
 */
interface DeleteCommentRequestConfig extends AxiosRequestConfig, RequestConfig {}

/**
 * Validates the input parameters for the deleteComment function
 * @param params The parameters to validate
 * @throws {CommentDeletionError} If validation fails
 */
function validateDeleteParams(params: unknown): asserts params is { id: number; userId: string | number } {
  if (!params || typeof params !== 'object') {
    throw new CommentDeletionError('Invalid parameters: params must be an object', 400, 'INVALID_PARAMS');
  }

  const { id, userId } = params as { id?: unknown; userId?: unknown };
  
  if (id == null) {
    throw new CommentDeletionError('Comment ID is required', 400, 'MISSING_COMMENT_ID');
  }
  
  if (userId == null) {
    throw new CommentDeletionError('User ID is required', 400, 'MISSING_USER_ID');
  }

  if (typeof id !== 'number' || isNaN(id)) {
    throw new CommentDeletionError('Comment ID must be a number', 400, 'INVALID_COMMENT_ID');
  }
}

/**
 * Deletes a comment from the server with enhanced type safety and error handling
 * 
 * @param params - The parameters for deleting a comment
 * @param config - Optional request configuration
 * @returns A promise that resolves to the deletion response
 * @throws {CommentDeletionError} If the request fails or the response is invalid
 * 
 * @example
 * ```typescript
 * try {
 *   const response = await deleteComment({
 *     id: 123,
 *     userId: 'user123',
 *     reason: 'Inappropriate content'
 *   });
 *   console.log('Comment deleted:', response.data);
 * } catch (error) {
 *   if (error instanceof CommentDeletionError) {
 *     console.error(`Deletion failed (${error.status}): ${error.message}`);
 *   } else {
 *     console.error('Unexpected error:', error);
 *   }
 * }
 * ```
 */
export const deleteComment = async (
  params: { id: number; userId: string | number; reason?: string },
  config: Partial<DeleteCommentRequestConfig> = {}
): Promise<AxiosResponse<ApiResponse<DeleteCommentResponse>>> => {
  // Validate input parameters
  validateDeleteParams(params);

  // Configure request with defaults and overrides
  const requestConfig: DeleteCommentRequestConfig = {
    method: 'DELETE',
    url: `/api/comments/${params.id}`,
    headers: {
      'Content-Type': 'application/json',
      'User': params.userId.toString(),
      ...(config.headers || {})
    },
    params: {
      v: '43', // API version
      ...(params.reason && { reason: params.reason })
    },
    validateStatus: (status) => status >= 200 && status < 500,
    timeout: 15000, // 15 seconds
    ...config,
    meta: {
      requestId: `comment-delete-${Date.now()}`,
      ...(config.meta || {})
    }
  };

  try {
    const response = await axios.request<ApiResponse<DeleteCommentResponse>>(requestConfig);
    
    // Validate response structure
    if (!response.data || typeof response.data !== 'object') {
      throw new CommentDeletionError(
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

    // Check for API-level errors in the response data structure
    if (isErrorResponse(response.data)) {
      throw new CommentDeletionError(
        response.data.error || 'Failed to delete comment',
        response.status,
        response.data.code ? String(response.data.code) : 'DELETE_FAILED',
        { response: response.data }
      );
    }

    // Handle non-error responses that indicate failure
    if (response.status >= 400) {
      throw new CommentDeletionError(
        'Failed to delete comment',
        response.status,
        'DELETE_FAILED',
        { response: response.data }
      );
    }
    
    return response;
  } catch (error) {
    if (error instanceof CommentDeletionError) {
      throw error; // Re-throw our custom error
    }
    
    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const responseData = error.response?.data as { message?: string } | undefined;
      const message = responseData?.message || error.message || 'Failed to delete comment';
      
      throw new CommentDeletionError(
        message,
        status,
        error.code || 'NETWORK_ERROR',
        {
          request: error.config ? {
            url: error.config.url,
            method: error.config.method,
            params: error.config.params
          } : undefined,
          response: error.response?.data
        }
      );
    }
    
    // Handle unexpected errors
    throw new CommentDeletionError(
      error instanceof Error ? error.message : 'An unknown error occurred',
      undefined,
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
};