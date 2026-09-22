/**
 * Application Configuration
 * Automatically resolves backend API URL:
 * - If user opens via local network IP (e.g. 192.168.x.x), dynamically routes to that host on port 8001
 * - Otherwise falls back to VITE_API_BASE_URL or http://localhost:8001
 */
const getApiBaseUrl = (): string => {
  if (
    typeof window !== 'undefined' &&
    window.location.hostname &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return `http://${window.location.hostname}:8001`;
  }
  return (
    (import.meta.env.VITE_API_BASE_URL as string) ||
    (import.meta.env.API_BASE_URL as string) ||
    'http://localhost:8001'
  );
};

export const API_BASE_URL: string = getApiBaseUrl();

