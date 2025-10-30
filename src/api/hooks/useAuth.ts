import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as authEndpoints from '../endpoints/auth';
import { RegisterUser, LoginUser, ChangePassword, ForgotPassword, ResetPassword } from '../models';
import { TokenManager } from '../client';

// Query Keys
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  providers: () => [...authKeys.all, 'providers'] as const,
};

// ===== QUERIES =====

// Get OAuth Providers
export const useGetOAuthProviders = () =>
  useQuery({
    queryKey: authKeys.providers(),
    queryFn: authEndpoints.getOAuthProviders,
  });

// Get Current User
export const useGetCurrentUser = () =>
  useQuery({
    queryKey: authKeys.me(),
    queryFn: authEndpoints.getCurrentUser,
    retry: false,
  });

// Validate Session
export const useValidateSession = () =>
  useQuery({
    queryKey: authKeys.session(),
    queryFn: authEndpoints.validateSession,
    retry: false,
  });

// ===== MUTATIONS =====

// Register
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterUser) => authEndpoints.register(data),
    onSuccess: data => {
      queryClient.setQueryData(authKeys.me(), data);
    },
  });
};

// Login
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginUser) => authEndpoints.login(data),
    onSuccess: data => {
      queryClient.setQueryData(authKeys.me(), data);
    },
  });
};

// Logout
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authEndpoints.logout,
    onSuccess: async () => {
      await TokenManager.clearAll();
      queryClient.clear();
    },
  });
};

// Verify Email
export const useVerifyEmail = () =>
  useMutation({
    mutationFn: (token: string) => authEndpoints.verifyEmail(token),
  });

// Resend Verification
export const useResendVerification = () =>
  useMutation({
    mutationFn: (email: string) => authEndpoints.resendVerification(email),
  });

// Forgot Password
export const useForgotPassword = () =>
  useMutation({
    mutationFn: (data: ForgotPassword) => authEndpoints.forgotPassword(data),
  });

// Validate Reset Token
export const useValidateResetToken = (token: string) =>
  useQuery({
    queryKey: [...authKeys.all, 'reset-token', token],
    queryFn: () => authEndpoints.validateResetToken(token),
    enabled: !!token,
  });

// Reset Password
export const useResetPassword = () =>
  useMutation({
    mutationFn: ({ token, data }: { token: string; data: ResetPassword }) =>
      authEndpoints.resetPassword(token, data),
  });

// Change Password
export const useChangePassword = () =>
  useMutation({
    mutationFn: (data: ChangePassword) => authEndpoints.changePassword(data),
  });

// Deactivate Account
export const useDeactivateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authEndpoints.deactivateAccount,
    onSuccess: async () => {
      await TokenManager.clearAll();
      queryClient.clear();
    },
  });
};
