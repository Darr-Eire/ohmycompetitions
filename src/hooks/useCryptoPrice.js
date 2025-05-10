import useSWR from 'swr'
import tokenIdMap from '@/utils/tokenIdMap' // adjust if no alias

const fetcher = url => fetch(url).then(res => res.json())

export default function useCryptoPrice(symbol = 'BTC') {
  const coinId = tokenIdMap[symbol.toUpperCase()] || 'bitcoin'

  const { data, error } = useSWR(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
    fetcher,
    { refreshInterval: 10000 }
  )

  return {
    price: data?.[coinId]?.usd || null,
    isLoading: !error && !data,
    isError: error,
  }
}
