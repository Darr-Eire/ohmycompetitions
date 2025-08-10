'use client';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((r) => r.json());

/** Detail for a single funnel by slug */
export function useFunnelDetail(slug) {
  const shouldFetch = typeof slug === 'string' && slug.length > 0;
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? `/api/funnel/${slug}` : null,
    fetcher
  );
  return { comp: data || null, isLoading: !!shouldFetch && isLoading, error: error || null, mutate };
}

/** Live/filling comps for a given stage (used on /battles) */
export function useFunnelStage(stage = 1) {
  const valid = Number.isFinite(stage) && stage > 0;
  const { data, error, isLoading, mutate } = useSWR(
    valid ? `/api/funnel/live?stage=${stage}` : null,
    fetcher
  );
  return {
    stage,
    filling: data?.filling || [],
    live: data?.live || [],
    counts: data?.counts || { filling: 0, live: 0 },
    isLoading: !!valid && isLoading,
    error: error || null,
    mutate
  };
}
