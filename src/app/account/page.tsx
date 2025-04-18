import dynamic from 'next/dynamic'

// Import the client-side component dynamically with `ssr: false` NOT allowed here anymore
// Instead, just render a client component directly

import AccountClient from '@/components/AccountClient'

export default function AccountPage() {
  return <AccountClient />
}
