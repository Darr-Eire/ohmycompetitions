// pages/index.js
import Head from 'next/head'
import PiLoginButton from '../src/components/PiLoginButton'

export default function Home() {
  return (
    <>
      <Head>
        <title>OhMyCompetitions</title>
      </Head>
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">Welcome to OhMyCompetitions</h1>
        <PiLoginButton />
        {/* …rest of your page… */}
      </main>
    </>
  )
}
