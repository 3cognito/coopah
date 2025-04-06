export async function makeRequest<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  body?: object,
  token?: string,
  headers?: Record<string, string>
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  return await fetch(url, options);
}
