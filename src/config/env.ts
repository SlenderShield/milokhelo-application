import { z } from 'zod';
import Constants from 'expo-constants';

const envSchema = z.object({
  API_BASE_URL: z.string().url(),
  API_TIMEOUT: z.string().transform(Number).default('10000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Parse environment variables
const envVars = {
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:4000/api/v1',
  API_TIMEOUT: process.env.API_TIMEOUT || '10000',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

export const env = envSchema.parse(envVars);

export const API_BASE_URL = env.API_BASE_URL;
export const API_TIMEOUT = env.API_TIMEOUT;
export const IS_DEV = env.NODE_ENV === 'development';
export const IS_PROD = env.NODE_ENV === 'production';
