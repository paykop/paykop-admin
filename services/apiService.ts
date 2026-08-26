// src/services/apiService.ts
import axios, { type Method } from "axios";
import { z } from "zod";
import api, { postWithIdempotency, setTokens, getAccessToken, getRefreshToken, clearTokens, handleLogout } from "../lib/api/client";

export { api, postWithIdempotency, setTokens, getAccessToken, getRefreshToken, clearTokens, handleLogout };

interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
}

/**
 * Custom error class for API failures
 */
export class ApiError extends Error {
  status: number;
  info?: unknown;

  constructor(message: string, status: number, info?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.info = info;
  }
}

/**
 * Generic API request wrapper with built-in Zod validation for response data using our Axios client
 */
export async function apiRequest<TSchema extends z.ZodTypeAny>(
  endpoint: string,
  schema: TSchema,
  options: FetchOptions = {}
): Promise<z.infer<TSchema>> {
  const { params } = options;

  try {
    // Parse body from JSON string if needed to support existing fetch-style call payloads
    let requestData = options.body;
    if (typeof options.body === "string") {
      try {
        requestData = JSON.parse(options.body);
      } catch {
        requestData = options.body;
      }
    }

    const method = (options.method || "GET").toUpperCase();

    // Use interceptor-configured api client
    const response = await api({
      url: endpoint,
      method: method as Method,
      params,
      headers: {
        ...options.headers,
      },
      data: requestData,
    });

    const data = response.data;

    // Validate response using Zod schema to ensure data contract matching
    const result = schema.safeParse(data);
    if (!result.success) {
      console.error("API response schema validation failed:", result.error.format());
      throw new Error("API response did not match the expected contract.");
    }

    return result.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const info = error.response?.data;
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.message;
      throw new ApiError(message, status, info);
    }
    if (error instanceof ApiError || error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown network error occurred.");
  }
}
