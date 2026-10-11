import { NextResponse } from "next/server";
const BACKEND_URL = process.env.CLUB_API_URL;
if (!BACKEND_URL) {
  throw new Error("CLUB_API_URL is not defined");
}
const backendURLConfig = {
  baseUrl: BACKEND_URL.replace(/\/+$/, ""),
  apiPrefix: "/api/v1",
};
export class BackendAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data: unknown,
  ) {
    super(message);
    this.name = "BackendAPIError";
  }
}
export const BackEndAPIRequest = async <T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T | NextResponse> => {
  const normalizedPath = path.replace(/^\/+/, "");
  const url = `${backendURLConfig.baseUrl}${backendURLConfig.apiPrefix}/${normalizedPath}`;
  const response = await fetch(url, options);
  const text = await response.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = text || undefined;
  }
  if (!response.ok) {
    const body = typeof data === "object" && data !== null ? (data as { message?: string; error?: string }) : {};
    const message = body.message || body.error || (typeof data === "string" ? data : `Backend request failed with status ${response.status}`);
    throw new BackendAPIError(message, response.status, data);
  }
  return data as T;
}