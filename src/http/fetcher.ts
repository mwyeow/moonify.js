import { MoonifyApiError } from "../errors/index.js";

export interface RequestOptions {
  headers?: Record<string, string>;
  body?: string;
  method?: "GET" | "POST";
  timeoutMs?: number;
}

export async function requestJson<T>(
  service: "lastfm" | "spotify",
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const { headers, body, method = "GET", timeoutMs = 8000 } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown response body");
      throw new MoonifyApiError(service, res.status, errorText);
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
