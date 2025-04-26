// pages/index.js
import Head from 'next/head'
import PiLoginButton from '../src/components/PiLoginButton'

export default function Home() {
  return (
    <>
      <Head>
        <title>OhMyCompetitions</title>
        <meta name="description" content="Pi Network competition platform" />
      </Head>
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '5rem' }}>
        <h1>Welcome to OhMyCompetitions!</h1>
        <p>Please log in with your Pi account:</p>
        <PiLoginButton apiBaseUrl="/api/auth/pi-login" />
      </main>
    </>
  )
}
