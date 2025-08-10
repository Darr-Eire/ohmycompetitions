// file: src/lib/api.js
export const fetcher = (url) =>
  fetch(url).then(async (r) => {
    if (!r.ok) throw new Error((await r.json()).error || 'Request failed');
    return r.json();
  });

export async function postJSON(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}
