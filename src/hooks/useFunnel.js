// If you already have this file, make sure it exports useFunnelDetail exactly as below.

'use client';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((r) => r.json());

export function useFunnelDetail(slug) {
  const shouldFetch = typeof slug === 'string' && slug.length > 0;
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? `/api/funnel/${slug}` : null,
    fetcher
  );

  return {
    comp: data || null,
    isLoading: !!shouldFetch && isLoading,
    error: error || null,
    mutate
  };
}
