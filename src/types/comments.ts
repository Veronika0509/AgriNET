// Type for user IDs that can be either string or number
export type UserId = string | number;

/**
 * Comment type definition representing a category/type of comments
 */
export interface CommentType {
  /** Unique identifier for the comment type */
  id: number;
  /** Display name of the comment type */
  name: string;
  /** Description of what this comment type represents */
  description: string;
  /** ISO timestamp when the comment type was created */
  createdAt: string;
  /** ISO timestamp when the comment type was last updated */
  updatedAt: string;
}

/**
 * Sort direction for comment lists
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Available sort fields for comments
 */
export type CommentSortField = 'chartKind' | 'type' | 'date';

/**
 * Sort option for comments combining field and direction
 */
export type CommentSortOption = 
  | 'chartKind' 
  | 'type' 
  | 'dateDesc' 
  | 'dateAsc' 
  | 'newest' 
  | 'oldest';

/**
 * Represents a single comment in the system
 */
export interface CommentItem {
  /** Unique identifier for the comment */
  id: number;
  /** Type of chart this comment is associated with */
  chartKind: string;
  /** ID of the sensor this comment is related to */
  sensorId: string;
  /** Type ID of the comment */
  type: number;
  /** Field name or identifier */
  field: string;
  /** Date of the comment in ISO format */
  date: string;
  /** The comment text content */
  text: string;
  /** ID of the user who created the comment */
  userId: number;
  /** Display name of the user who created the comment */
  userName: string;
  /** Email of the user who created the comment */
  userEmail: string;
  /** ISO timestamp when the comment was created */
  createdAt: string;
  /** ISO timestamp when the comment was last updated */
  updatedAt: string;
}

/**
 * Represents a chart kind in the system
 */
export interface ChartKind {
  /** Unique identifier for the chart kind */
  id: string;
  /** Display name of the chart kind */
  name: string;
}

/**
 * Props for the Comments component
 */
export interface CommentsProps {
  /** Previous page URL for navigation */
  previousPage?: string;
  /** ID of the current user */
  userId: UserId;
  /** Additional properties */
  [key: string]: unknown;
}

/**
 * Parameters for fetching comments from the API
 */
export interface GetCommentsParams {
  /** Sort order for comments */
  sort: CommentSortOption;
  /** Pagination start index (0-based) */
  startIndex: number;
  /** Type of comments to fetch */
  type: number;
  /** ID of the user making the request */
  userId: UserId;
  /** Optional sensor ID to filter comments */
  sensorId?: string;
}

/**
 * Parameters for creating or updating a comment
 */
export interface SaveCommentParams {
  /** Comment ID (required for updates) */
  id?: number;
  /** Type of chart the comment is associated with */
  chartKind: string;
  /** Sensor ID the comment is related to */
  sensorId: string;
  /** Comment type ID */
  type: number;
  /** Field name or identifier */
  field: string;
  /** Date of the comment in YYYY-MM-DD format */
  date: string;
  /** Comment text content (1-1000 characters) */
  text: string;
  /** ID of the user creating/updating the comment */
  userId: UserId;
  /** Additional options */
  opts?: {
    /** User ID for permission checking */
    userId: UserId;
    /** Optional timestamp for the operation */
    timestamp?: number;
  };
}

/**
 * Parameters for deleting a comment
 */
export interface DeleteCommentParams {
  /** ID of the comment to delete */
  id: number;
  /** ID of the user performing the deletion */
  userId: UserId;
  /** Optional reason for deletion */
  reason?: string;
}

/**
 * Base API response interface
 * @template T Type of the data payload
 */
export interface BaseApiResponse<T> {
  /** Indicates if the request was successful */
  success: boolean;
  /** Response data */
  data: T;
  /** Optional error message */
  error?: string;
  /** Optional status code */
  status?: number;
}

/**
 * Response containing a list of comments
 */
export interface CommentsResponse extends BaseApiResponse<CommentItem[]> {
  /** Total number of available comments */
  total: number;
  /** Number of items per page */
  limit: number;
  /** Pagination offset */
  offset: number;
  /** Optional timestamp of when the data was fetched */
  timestamp?: number;
}

/**
 * Response containing comment types
 */
export interface CommentTypesResponse extends BaseApiResponse<CommentType[]> {
  /** Timestamp of when the types were last updated */
  lastUpdated?: string;
  /** Total count of available types */
  total: number;
  /** Number of items per page */
  limit: number;
  /** Pagination offset */
  offset: number;
}

/**
 * Response after saving a comment
 */
export interface SaveCommentResponse extends BaseApiResponse<CommentItem> {
  /** Indicates if this was an update to an existing comment */
  wasUpdated: boolean;
  /** Previous version of the comment (if updated) */
  previousVersion?: Omit<CommentItem, 'id' | 'createdAt' | 'updatedAt'>;
}

/**
 * Response after deleting a comment
 */
export interface DeleteCommentResponse extends BaseApiResponse<{ id: number }> {
  /** Timestamp of when the comment was deleted */
  deletedAt: string;
  /** ID of the user who performed the deletion */
  deletedBy: UserId;
  /** Optional reason for deletion */
  reason?: string;
}

/**
 * Form values for creating/editing a comment
 */
export interface CommentFormValues {
  /** Comment ID (for updates) */
  id?: number;
  /** Type of chart the comment is associated with */
  chartKind: string;
  /** Sensor ID the comment is related to */
  sensorId: string;
  /** Comment type ID */
  type: number;
  /** Field name or identifier */
  field: string;
  /** Date of the comment in YYYY-MM-DD format */
  date: string;
  /** Comment text content */
  text: string;
  /** Optional creation timestamp */
  createdAt?: string;
  /** Optional update timestamp */
  updatedAt?: string;
}

/**
 * UI Sort option for comments
 */
export interface SortOption<T extends string = string> {
  /** Value used for sorting */
  value: T;
  /** Display label */
  label: string;
  /** Optional icon name */
  icon?: string;
  /** Sort direction (asc/desc) */
  direction?: SortDirection;
  /** Is this the default sort option? */
  isDefault?: boolean;
}

/**
 * State for the comment modal
 */
export interface CommentModalState {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** The comment being edited (if any) */
  comment: CommentItem | null;
  /** Whether the modal is in edit mode */
  isEditMode: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error message (if any) */
  error?: string;
  /** Timestamp of when the state was last updated */
  lastUpdated?: number;
}

/**
 * Extended error information for API responses
 */
export interface ApiError extends Error {
  /** HTTP status code */
  status?: number;
  /** Error code from the API */
  code?: string | number;
  /** Additional error details */
  details?: Record<string, unknown>;
  /** Timestamp when the error occurred */
  timestamp?: string;
  /** Request ID for tracking */
  requestId?: string;
}

/**
 * Extended Axios request configuration
 */
export interface RequestConfig extends Record<string, unknown> {
  /** Whether to show loading indicator */
  showLoading?: boolean;
  /** Whether to show error messages */
  showError?: boolean;
  /** Custom error message */
  errorMessage?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Whether to retry on failure */
  retry?: boolean;
  /** Number of retry attempts */
  retryCount?: number;
  /** Retry delay in milliseconds */
  retryDelay?: number;
  /** Request metadata */
  meta?: Record<string, unknown>;
}

/**
 * Extended Axios response
 */
export interface ApiResponse<T = unknown> {
  /** Response data */
  data: T;
  /** HTTP status code */
  status: number;
  /** HTTP status text */
  statusText: string;
  /** Response headers */
  headers: Record<string, string>;
  /** Request configuration */
  config: RequestConfig;
  /** Original request object */
  request?: XMLHttpRequest;
  /** Response time in milliseconds */
  responseTime?: number;
  /** Request timestamp */
  timestamp?: number;
  /** Additional metadata */
  meta?: Record<string, unknown>;
}
