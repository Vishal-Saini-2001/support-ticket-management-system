import axios, { type AxiosError } from 'axios';
import type { ApiErrorPayload } from '@/types/api';

export interface ParsedApiError {
  message: string;
  fieldErrors: Record<string, string>;
}

export function extractApiError(error: unknown, fallback = 'Something went wrong. Please try again.'): ParsedApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorPayload>;
    const payload = axiosError.response?.data;
    const fieldErrors: Record<string, string> = {};

    if (payload?.errors && Array.isArray(payload.errors)) {
      for (const item of payload.errors) {
        if (item.field && item.message) {
          fieldErrors[item.field] = item.message;
        }
      }
    }

    return {
      message: payload?.message || axiosError.message || fallback,
      fieldErrors,
    };
  }

  if (error instanceof Error) {
    return { message: error.message, fieldErrors: {} };
  }

  return { message: fallback, fieldErrors: {} };
}

