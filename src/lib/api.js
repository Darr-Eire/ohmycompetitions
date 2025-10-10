// file: src/lib/api.js

/** Internal helper: safely parse a Response body as JSON, fallback to text */
async function safeParse(response) {
  try {
    return await response.clone().json();
  } catch {
    try {
      const text = await response.clone().text();
      return text ? { message: text } : {};
    } catch {
      return {};
    }
  }
}

/** SWR-style fetcher with richer errors */
export const fetcher = async (url) => {
  let res;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch (networkErr) {
    const err = new Error(`Network error fetching ${url}`);
    err.cause = networkErr;
    throw err;
  }

  const data = await safeParse(res);
  if (!res.ok) {
    const msg = data?.error || data?.message || `${res.status} ${res.statusText}`;
    const err = new Error(`${msg} [${res.status} ${url}]`);
    err.status = res.status;
    err.payload = data;
    err.url = url;
    throw err;
  }
  return data;
};

/** POST JSON with detailed error information */
export async function postJSON(url, body) {
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body ?? {}),
    });
  } catch (networkErr) {
    const err = new Error(`Network error posting to ${url}`);
    err.cause = networkErr;
    throw err;
  }

  const data = await safeParse(res);
  if (!res.ok) {
    const msg = data?.error || data?.message || `${res.status} ${res.statusText}`;
    const err = new Error(`${msg} [${res.status} ${url}]`);
    err.status = res.status;
    err.payload = data; // includes server-side { debug: ... } if provided
    err.url = url;
    throw err;
  }
  return data;
}
