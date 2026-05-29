import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

const LOCAL_API = 'http://localhost:3000/api';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 600;

type RetryConfig = InternalAxiosRequestConfig & { __retryCount?: number };

function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (import.meta.env.DEV) return LOCAL_API;

  throw new Error(
    'VITE_API_URL is not set. Add it in Vercel (Settings → Environment Variables) and redeploy.',
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isRetriable(error: AxiosError): boolean {
  if (!error.response) return true;
  const status = error.response.status;
  return status === 502 || status === 503 || status === 504;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 30_000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;

    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (config && isRetriable(error)) {
      const count = config.__retryCount ?? 0;
      const method = config.method?.toLowerCase() ?? 'get';
      const safeToRetry =
        method === 'get' || method === 'head' || method === 'options';

      if (safeToRetry && count < MAX_RETRIES) {
        config.__retryCount = count + 1;
        await sleep(RETRY_DELAY_MS * (count + 1));
        return api(config);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
