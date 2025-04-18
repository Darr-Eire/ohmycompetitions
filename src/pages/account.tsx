// pages/account.tsx

import dynamic from 'next/dynamic'

// Dynamically import the client component to avoid SSR issues
const AccountClient = dynamic(() => import('../components/AccountClient'), { ssr: false })

export default function AccountPage() {
  return <AccountClient />
}
