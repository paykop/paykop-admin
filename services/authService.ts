// src/services/authService.ts
import { apiRequest } from "./apiService";
import {
  otpRequestResponseSchema,
  otpVerifyResponseSchema,
  refreshTokenResponseSchema,
  logoutResponseSchema,
  OtpVerifyResponse,
  RefreshTokenResponse,
} from "../schemas/authSchema";
import {
  setTokens,
  clearTokens,
  getRefreshToken,
  getAccessToken,
} from "../lib/api/client";

/**
 * Request Admin login OTP
 */
export async function requestAdminOtp(email: string) {
  return apiRequest("/api/v1/admin/auth/otp/request", otpRequestResponseSchema, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * Verify Admin OTP and store session tokens
 */
export async function verifyAdminOtp(
  email: string,
  otp: string
): Promise<OtpVerifyResponse> {
  const result = await apiRequest("/api/v1/admin/auth/otp/verify", otpVerifyResponseSchema, {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });

  setTokens(result.access_token, result.refresh_token, result.expires_in);
  return result;
}

/**
 * Refresh Admin Session Token
 */
export async function refreshAdminToken(
  refreshToken?: string
): Promise<RefreshTokenResponse> {
  const tokenToUse = refreshToken || getRefreshToken();
  if (!tokenToUse) {
    throw new Error("No refresh token available");
  }

  const result = await apiRequest("/api/v1/admin/auth/refresh", refreshTokenResponseSchema, {
    method: "POST",
    body: JSON.stringify({ refresh_token: tokenToUse }),
  });

  if (result.access_token) {
    setTokens(
      result.access_token,
      result.refresh_token || tokenToUse,
      result.expires_in
    );
  }

  return result;
}

/**
 * Logout Admin and invalidate server session
 */
export async function logoutAdmin(): Promise<void> {
  const refreshToken = getRefreshToken();
  const accessToken = getAccessToken();

  try {
    if (accessToken && refreshToken) {
      await apiRequest("/api/v1/auth/logout", logoutResponseSchema, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    }
  } catch (err) {
    console.warn("Server logout notification failed:", err);
  } finally {
    clearTokens();
  }
}
