// pages/_app.js
import React from 'react'
import { SessionProvider } from 'next-auth/react'
import Layout from '@/components/layout'
import { PiAuthProvider } from '@/contexts/PiAuthContext'
import '@fontsource/orbitron' // ✅ Futuristic font
import 'styles/globals.css'   // ✅ Your global styles

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <PiAuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </PiAuthProvider>
    </SessionProvider>
  )
}
