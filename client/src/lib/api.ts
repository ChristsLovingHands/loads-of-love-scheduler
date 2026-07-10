import { getAuthToken } from "./auth";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
  requiresAuth = false
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  
  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText || response.statusText;

    try {
      const parsed = JSON.parse(errorText);
      if (typeof parsed.message === "string") {
        message = parsed.message;
      }
    } catch {
      // Keep the raw response text when the API does not return JSON.
    }

    throw new Error(message);
  }
  
  return response;
}
