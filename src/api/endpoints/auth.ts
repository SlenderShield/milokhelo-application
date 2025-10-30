import { apiClient } from '../client';
import {
  RegisterUser,
  RegisterUserSchema,
  LoginUser,
  LoginUserSchema,
  OAuthProvider,
  OAuthProviderSchema,
  UserProfile,
  UserProfileSchema,
  ChangePassword,
  ForgotPassword,
  ResetPassword,
  TokenResponse,
  TokenResponseSchema,
} from '../models';

// Get OAuth Providers
export const getOAuthProviders = () =>
  apiClient
    .get<OAuthProvider[]>('/auth/providers')
    .then((res) => OAuthProviderSchema.array().parse(res.data));

// OAuth Google - Returns redirect URL
export const initiateGoogleOAuth = () =>
  apiClient.get<{ url: string }>('/auth/oauth/google').then((res) => res.data);

// OAuth Facebook - Returns redirect URL
export const initiateFacebookOAuth = () =>
  apiClient.get<{ url: string }>('/auth/oauth/facebook').then((res) => res.data);

// Register with Email/Password
export const register = (data: RegisterUser) =>
  apiClient
    .post<UserProfile>('/auth/register', RegisterUserSchema.parse(data))
    .then((res) => UserProfileSchema.parse(res.data));

// Login with Email/Password
export const login = (data: LoginUser) =>
  apiClient
    .post<UserProfile>('/auth/login', LoginUserSchema.parse(data))
    .then((res) => UserProfileSchema.parse(res.data));

// Get Current User
export const getCurrentUser = () =>
  apiClient
    .get<UserProfile>('/auth/me')
    .then((res) => UserProfileSchema.parse(res.data));

// Validate/Refresh Session
export const validateSession = () =>
  apiClient
    .get<UserProfile>('/auth/session')
    .then((res) => UserProfileSchema.parse(res.data));

// Logout
export const logout = () =>
  apiClient.post('/auth/logout').then((res) => res.data);

// Verify Email
export const verifyEmail = (token: string) =>
  apiClient.post(`/auth/verify-email/${token}`).then((res) => res.data);

// Resend Verification Email
export const resendVerification = (email: string) =>
  apiClient
    .post('/auth/resend-verification', { email })
    .then((res) => res.data);

// Forgot Password
export const forgotPassword = (data: ForgotPassword) =>
  apiClient.post('/auth/forgot-password', data).then((res) => res.data);

// Validate Reset Token
export const validateResetToken = (token: string) =>
  apiClient
    .get<{ valid: boolean }>(`/auth/validate-reset-token/${token}`)
    .then((res) => res.data);

// Reset Password
export const resetPassword = (token: string, data: ResetPassword) =>
  apiClient
    .post(`/auth/reset-password/${token}`, data)
    .then((res) => res.data);

// Refresh Token
export const refreshToken = (refreshToken: string) =>
  apiClient
    .post<TokenResponse>('/auth/refresh-token', { refreshToken })
    .then((res) => TokenResponseSchema.parse(res.data));

// Change Password
export const changePassword = (data: ChangePassword) =>
  apiClient.put('/auth/change-password', data).then((res) => res.data);

// Deactivate Account
export const deactivateAccount = () =>
  apiClient.delete('/auth/deactivate').then((res) => res.data);
