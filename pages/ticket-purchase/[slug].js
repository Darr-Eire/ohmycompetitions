'use client'
// pages/ticket-purchase/[slug].js

import { useRouter } from 'next/router'
import BuyTicketButton from '@/components/BuyTicketButton'

const COMPETITIONS = {
  // Tech
  'ps5-bundle-giveaway':    { title: 'PS5 Bundle Giveaway',        entryFee: 0.8  },
  '55-inch-tv-giveaway':     { title: '55″ TV Giveaway',             entryFee: 0.25 },
  'xbox-one-bundle':         { title: 'Xbox One Bundle',             entryFee: 0.3  },

  // Premium
  'tesla-model-3-giveaway':  { title: 'Tesla Model 3 Giveaway',      entryFee: 40   },
  'dubai-luxury-holiday':    { title: 'Dubai Luxury Holiday',        entryFee: 20   },
  'penthouse-hotel-stay':    { title: 'Penthouse Hotel Stay',        entryFee: 15   },

  // Pi
  'pi-giveaway-250k':        { title: '250 000 π Mega Giveaway',      entryFee: 15   },
  'pi-giveaway-100k':        { title: '100 000 π Grand Giveaway',      entryFee: 10   },
  'pi-giveaway-50k':         { title: '50 000 π Big Giveaway',        entryFee: 5    },

  // Daily
  'daily-jackpot':           { title: 'Daily Jackpot',               entryFee: 0.375},
  'everyday-pioneer':        { title: 'Everyday Pioneer',            entryFee: 0.314},
  'daily-pi-slice':          { title: 'Daily Pi Slice',              entryFee: 0.314},

  // Free
  'pi-day-freebie':          { title: 'Pi-Day Freebie',              entryFee: 0    },
  'pi-miners-bonanza':       { title: 'Pi Miners Bonanza',           entryFee: 0    },
  'weekly-giveaway':         { title: 'Weekly Giveaway',             entryFee: 0    },
}

export default function TicketPurchasePage() {
  const { query, isReady } = useRouter()
  // normalize slug (could be array)
  const slug = isReady
    ? Array.isArray(query.slug)
      ? query.slug[0]
      : query.slug
    : null

  if (!slug) return <p>Loading…</p>
  const comp = COMPETITIONS[slug]
  if (!comp) return <p>Competition “{slug}” not found</p>

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{comp.title}</h1>
      <p className="mb-6">Entry Fee: {comp.entryFee} π</p>
      <BuyTicketButton
        entryFee={comp.entryFee}
        competitionSlug={slug}
      />
    </div>
  )
}
