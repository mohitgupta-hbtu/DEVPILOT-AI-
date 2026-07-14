/* eslint-disable @typescript-eslint/no-explicit-any */
import { storageService } from "../storage";

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export interface RequestOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

export const BACKEND_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(
  /\/+$/,
  "",
);

const DEFAULT_RETRIES = 2;
const DEFAULT_DELAY = 1000;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { retries = DEFAULT_RETRIES, retryDelay = DEFAULT_DELAY, ...init } = options;
  const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BACKEND_URL}${formattedEndpoint}`;

  // Retrieve user settings dynamically for keys
  const settings = storageService.getSettings();

  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Inject user credentials if they exist
  const bodyData = init.body ? JSON.parse(init.body as string) : {};
  const mergedBody = {
    geminiApiKey: settings.geminiKey || undefined,
    openrouterApiKey: settings.openrouterKey || undefined,
    githubToken: settings.githubToken || undefined,
    ...bodyData,
  };

  let attempt = 0;
  let didRefresh = false;

  while (attempt <= retries) {
    try {
      const response = await fetch(url, {
        credentials: "include", // Essential for HttpOnly cookies (access_token)
        ...init,
        headers,
        body: init.method && init.method !== "GET" ? JSON.stringify(mergedBody) : undefined,
      });

      if (!response.ok) {
        // Special case: Silent Token Refresh interceptor
        if (response.status === 401 && !didRefresh && !endpoint.includes("/auth/")) {
          try {
            const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
              method: "POST",
              credentials: "include",
            });
            if (refreshRes.ok) {
              didRefresh = true;
              continue; // Retry the original request implicitly
            }
          } catch (e) {
            // Refresh network failure, fall through to default error
          }
        }

        let errMsg = `HTTP Error ${response.status}`;
        let details: any = null;
        try {
          details = await response.json();
          if (details && details.detail) {
            errMsg = details.detail;
          }
        } catch {
          const text = await response.text();
          if (text) errMsg = text;
        }

        // Retry only on server errors (5xx) or transient requests
        if (response.status >= 500 && attempt < retries) {
          attempt++;
          await sleep(retryDelay * attempt);
          continue;
        }

        throw new APIError(response.status, errMsg, details);
      }

      return (await response.json()) as T;
    } catch (error: any) {
      if (error instanceof APIError) {
        throw error;
      }

      if (attempt < retries) {
        attempt++;
        await sleep(retryDelay * attempt);
        continue;
      }

      throw new APIError(500, error.message || "Network Error occurred.");
    }
  }

  throw new APIError(500, "Request failed after maximum retries.");
}
