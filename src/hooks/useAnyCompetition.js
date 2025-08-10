'use client';
import useSWR from 'swr';

async function fetchAny(slug) {
  const ok = (r) => r.ok && r.status >= 200 && r.status < 300;

  // try funnel first
  let r = await fetch(`/api/funnel/${slug}`);
  if (ok(r)) {
    const data = await r.json();
    return { type: 'funnel', data };
  }
  if (r.status !== 404) {
    // some other error from funnel endpoint
    const err = await r.text().catch(() => 'error');
    throw new Error(err || 'Funnel fetch failed');
  }

  // fallback to admin competition
  r = await fetch(`/api/competitions/${slug}`);
  if (ok(r)) {
    const data = await r.json();
    return { type: 'competition', data };
  }
  if (r.status === 404) return { type: 'none', data: null };

  const err = await r.text().catch(() => 'error');
  throw new Error(err || 'Competition fetch failed');
}

export function useAnyCompetition(slug) {
  const shouldFetch = typeof slug === 'string' && slug.length > 0;
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['any-comp', slug] : null,
    () => fetchAny(slug)
  );

  return {
    type: data?.type || 'none',
    comp: data?.data || null,
    isLoading: !!shouldFetch && isLoading,
    error: error || null,
    mutate,
  };
}
