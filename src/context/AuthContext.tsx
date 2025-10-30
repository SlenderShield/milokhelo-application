import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGetCurrentUser, useLogin, useLogout, useRegister } from '@/src/api/hooks';
import { UserProfile, LoginUser, RegisterUser } from '@/src/api/models';
import { TokenManager } from '@/src/api/client';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginUser) => Promise<void>;
  register: (data: RegisterUser) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: user, isLoading, refetch } = useGetCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = await TokenManager.getToken();
      if (token) {
        refetch();
      }
      setIsInitialized(true);
    };
    checkAuth();
  }, []);

  const login = async (data: LoginUser) => {
    await loginMutation.mutateAsync(data);
  };

  const register = async (data: RegisterUser) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const value: AuthContextType = {
    user: user || null,
    isLoading: !isInitialized || isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
