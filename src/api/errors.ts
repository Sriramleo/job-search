/**
 * Standardized API Error class for Germany Job Hunt.
 * Parses the backend's standardized error envelope:
 * {
 *   "detail": "...",
 *   "error": {
 *     "code": "...",
 *     "message": "...",
 *     "requestId": "...",
 *     "details": {}
 *   }
 * }
 */

export interface BackendErrorEnvelope {
  detail?: string | any[];
  error?: {
    code?: string;
    message?: string;
    requestId?: string;
    details?: Record<string, any>;
  };
}

export class ApiError extends Error {
  status: number;
  code: string;
  requestId?: string;
  details?: Record<string, any>;

  constructor(
    message: string,
    status: number,
    code: string = 'API_ERROR',
    requestId?: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.details = details;
  }

  static fromResponse(status: number, body: any, headerRequestId?: string | null): ApiError {
    let message = 'An unexpected error occurred.';
    let code = `HTTP_${status}`;
    let requestId = headerRequestId || undefined;
    let details: Record<string, any> | undefined;

    if (body && typeof body === 'object') {
      if (body.error) {
        message = body.error.message || message;
        code = body.error.code || code;
        requestId = body.error.requestId || requestId;
        details = body.error.details;
      } else if (typeof body.detail === 'string') {
        message = body.detail;
      } else if (Array.isArray(body.detail)) {
        // Validation error array
        message = body.detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ');
        details = { validationErrors: body.detail };
        code = 'VALIDATION_ERROR';
      }
    } else if (typeof body === 'string' && body.trim()) {
      message = body;
    }

    return new ApiError(message, status, code, requestId, details);
  }
}
