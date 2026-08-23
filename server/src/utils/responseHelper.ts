import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
  details?: unknown;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
    page?: number;
    pages?: number;
  };
}

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200): Response {
  const responseBody: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(responseBody);
}

export function sendCreated<T>(res: Response, data: T, message = 'Resource created successfully'): Response {
  return sendSuccess(res, data, message, 201);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  limit: number,
  offset: number,
  message?: string
): Response {
  const responseBody: ApiResponse<T[]> = {
    success: true,
    message,
    data,
    meta: {
      total,
      limit,
      offset,
      page: Math.floor(offset / limit) + 1,
      pages: Math.ceil(total / limit) || 1,
    },
  };
  return res.status(200).json(responseBody);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errorCode = 'INTERNAL_SERVER_ERROR',
  details?: unknown
): Response {
  const responseBody: ApiResponse = {
    success: false,
    message,
    errorCode,
    details,
  };
  return res.status(statusCode).json(responseBody);
}
