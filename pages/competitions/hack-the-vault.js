import CompetitionCard from '@/components/CompetitionCard'

export default function HackTheVault() {
  return (
    <main className="page px-4 py-8">
      <CompetitionCard
        title="Hack The Vault"
        href="/competitions/hack-the-vault"
        prize="750 PI Bounty"
        fee="0.375 π"
      />
    </main>
  )
}
