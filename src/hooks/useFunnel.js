// file: src/hooks/useFunnel.js
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then(r => r.json());

export function useFunnelStage(stage) {
  const { data, error, mutate, isLoading } = useSWR(`/api/funnel/stage/${stage}`, fetcher, {
    refreshInterval: 4000, // keep it live-ish
    revalidateOnFocus: false,
  });

  return {
    filling: data?.filling || [],
    live: data?.live || [],
    isLoading,
    error,
    mutate,
  };
}
