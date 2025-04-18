import dynamic from 'next/dynamic'

// Dynamically load the AccountClient only on the client
const AccountClient = dynamic(() => import('@/components/AccountClient'), { ssr: false })

export default function AccountPage() {
  return <AccountClient />
}
