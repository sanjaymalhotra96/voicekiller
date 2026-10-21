// Supabase returns auth values in the query or fragment, depending on the flow.
export function callbackParams(url: string) {
  const params = new URLSearchParams();
  for (const part of [url.split('?')[1]?.split('#')[0], url.split('#')[1]]) {
    new URLSearchParams(part ?? '').forEach((value, key) =>
      params.set(key, value),
    );
  }
  return params;
}
