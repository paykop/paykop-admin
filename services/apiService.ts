// src/services/apiService.ts
import { z } from "zod";

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.example.com";

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
 * Generic API request wrapper with built-in Zod validation for response data
 */
export async function apiRequest<TSchema extends z.ZodTypeAny>(
  endpoint: string,
  schema: TSchema,
  options: FetchOptions = {}
): Promise<z.infer<TSchema>> {
  const { params, ...customConfig } = options;
  
  // Construct URL with query parameters
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
  }

  const headers = {
    "Content-Type": "application/json",
    'ngrok-skip-browser-warning': 'true',
    ...customConfig.headers,
  };

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  try {
    const response = await fetch(url.toString(), config);
    
    if (!response.ok) {
      let errorInfo;
      try {
        errorInfo = await response.json();
      } catch {
        errorInfo = await response.text();
      }
      throw new ApiError(
        `API request failed with status ${response.status}`,
        response.status,
        errorInfo
      );
    }

    const data = await response.json();
    
    // Validate response using Zod schema to ensure data contract matching
    const result = schema.safeParse(data);
    if (!result.success) {
      console.error("API response schema validation failed:", result.error.format());
      throw new Error("API response did not match the expected contract.");
    }

    return result.data;
  } catch (error) {
    if (error instanceof ApiError || error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown network error occurred.");
  }
}

// Example usage of a specific API endpoint call:
/*
export const fetchUserProfile = async (userId: string) => {
  return apiRequest(`/users/${userId}`, userProfileSchema);
};
*/
