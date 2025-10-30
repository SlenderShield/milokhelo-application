import { z } from 'zod';

// Register Schema
export const RegisterUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export type RegisterUser = z.infer<typeof RegisterUserSchema>;

// Login Schema
export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginUser = z.infer<typeof LoginUserSchema>;

// OAuth Provider Schema
export const OAuthProviderSchema = z.object({
  name: z.string(),
  displayName: z.string().optional(),
  authUrl: z.string().url().optional(),
});

export type OAuthProvider = z.infer<typeof OAuthProviderSchema>;

// Token Response Schema
export const TokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number().optional(),
  tokenType: z.string().default('Bearer'),
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;

// Change Password Schema
export const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export type ChangePassword = z.infer<typeof ChangePasswordSchema>;

// Forgot Password Schema
export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type ForgotPassword = z.infer<typeof ForgotPasswordSchema>;

// Reset Password Schema
export const ResetPasswordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export type ResetPassword = z.infer<typeof ResetPasswordSchema>;
