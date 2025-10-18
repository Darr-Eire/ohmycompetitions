'use client';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then(r => r.json());

export function useFunnelStages() {
  const { data, error, isLoading, mutate } = useSWR('/api/funnel/stages', fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 10_000,
  });

  const ok = data?.success && Array.isArray(data?.stages);
  const stages = ok ? data.stages : [];
  const prizePoolPi = ok ? (data.prizePoolPi ?? 0) : 0;

  return {
    stages,
    prizePoolPi,
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}
