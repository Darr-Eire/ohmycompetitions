// pages/_app.js
import React from 'react'
import { SessionProvider } from 'next-auth/react'
import Layout from '@/components/layout'
import { PiAuthProvider } from '@/contexts/PiAuthContext'
import 'styles/globals.css'

export default function App({ Component, pageProps: { session, ...rest } }) {
  return (
    <SessionProvider session={session}>
      <PiAuthProvider>
        <Layout>
          <Component {...rest} />
        </Layout>
      </PiAuthProvider>
    </SessionProvider>
  )
}
