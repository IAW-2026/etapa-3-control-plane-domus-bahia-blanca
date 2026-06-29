const SELLERAPP_API = process.env.SELLERAPP_API_URL!;
const API_KEY = process.env.SELLERAPP_API_KEY!;

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${SELLERAPP_API}${path}`, {
    ...options,
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? `Error ${res.status}`);
  }
  return res.json();
}
