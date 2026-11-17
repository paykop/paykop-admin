// src/schemas/authSchema.ts
import { z } from "zod";

export const otpRequestSchema = z.object({
  email: z.string().email(),
});

export const otpRequestResponseSchema = z.object({
  message: z.string().optional(),
  status: z.string().optional(),
  otp: z.string().optional(),
  debug_otp: z.string().optional(),
}).passthrough();

export type OtpRequestResponse = z.infer<typeof otpRequestResponseSchema>;

export const otpVerifyResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string().optional().default("Bearer"),
  expires_in: z.number().optional().default(86400),
});

export const refreshTokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  token_type: z.string().optional().default("Bearer"),
  expires_in: z.number().optional(),
}).passthrough();

export const logoutResponseSchema = z.object({
  message: z.string().optional(),
  status: z.string().optional(),
}).passthrough();

export type OtpVerifyResponse = z.infer<typeof otpVerifyResponseSchema>;
export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;
