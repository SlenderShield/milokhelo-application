export const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || 'http://localhost:4000/api/v1',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_token',
  SESSION_KEY: 'session',
  REFRESH_TOKEN_KEY: 'refresh_token',
} as const;

export const QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  RETRY: 2,
} as const;
