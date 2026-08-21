/**
 * Application Configuration
 * Automatically loaded from .env (API_BASE_URL or VITE_API_BASE_URL)
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  (import.meta.env.API_BASE_URL as string) ||
  'http://localhost:8001';

