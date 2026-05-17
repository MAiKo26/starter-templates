import { APIError } from "@/lib/api-error"
import { env } from "@/lib/env"

interface RequestConfig<P = object> extends RequestInit {
  params?: P
}

async function httpClient<P = object, T = unknown>(
  path: string,
  config: RequestConfig<P> = {},
): Promise<T> {
  const { params, ...init } = config

  const url = new URL(path, env.VITE_API_URL)

  if (params) {
    Object.entries(params as Record<string, unknown>).forEach(
      ([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value))
        }
      },
    )
  }

  const response = await fetch(url.toString(), {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  })

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      detail?: string
      error?: string
      message?: string
    }

    throw new APIError(
      errorData.detail ??
        errorData.error ??
        errorData.message ??
        `HTTP ${response.status}`,
      response.status,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const http = {
  get: <T, P = object>(path: string, config?: RequestConfig<P>) =>
    httpClient<P, T>(path, { ...config, method: "GET" }),

  post: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    httpClient<object, T>(path, {
      ...config,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    httpClient<object, T>(path, {
      ...config,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    httpClient<object, T>(path, {
      ...config,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, config?: RequestConfig) =>
    httpClient<object, T>(path, { ...config, method: "DELETE" }),
}

export { httpClient }
