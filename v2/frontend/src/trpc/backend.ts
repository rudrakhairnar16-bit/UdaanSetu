export async function backendFetch(
  backendUrl: string,
  token: string | null | undefined,
  path: string,
  options: RequestInit = {},
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${backendUrl}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Backend ${res.status}: ${body}`);
  }

  return res.json();
}
