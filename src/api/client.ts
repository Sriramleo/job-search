/// <reference types="vite/client" />
/**
 * Centralized HTTP API Client for Germany Job Hunt Frontend.
 * Propagates X-Request-ID headers, formats requests, and maps backend error envelopes into ApiError.
 */

import { ApiError } from './errors';

// Production default to Oracle backend
const DEFAULT_API_URL = 'https://api-jobsearch.sriramdevops.site';
const ENV_URL = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = (
  ENV_URL !== undefined && ENV_URL !== ''
    ? ENV_URL
    : DEFAULT_API_URL
).replace(/\/+$/, '');

export const isBackendConfigured = (): boolean => {
  return true;
};

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: any;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, headers = {}, ...customConfig } = options;

  let url = `${API_BASE_URL}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    }
    const qs = query.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  // Generate or propagate X-Request-ID
  const requestId =
    (headers as Record<string, string>)['X-Request-ID'] ||
    `fe-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-ID': requestId,
    ...(headers as Record<string, string>),
  };

  const config: RequestInit = {
    ...customConfig,
    headers: requestHeaders,
    body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (err: any) {
    throw new ApiError(
      `Network connection failed: ${err.message || 'Server unreachable'}`,
      0,
      'NETWORK_ERROR',
      requestId
    );
  }

  const responseRequestId = response.headers.get('X-Request-ID') || requestId;

  // Handle No Content
  if (response.status === 204) {
    return {} as T;
  }

  let data: any;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw ApiError.fromResponse(response.status, data, responseRequestId);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body }),
  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }),
  put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', body }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
