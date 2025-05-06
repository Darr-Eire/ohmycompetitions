// pages/_app.js
import React from 'react'
import { SessionProvider } from 'next-auth/react'
import Layout from '@/components/Layout'
import 'styles/globals.css'

export default function App({ Component, pageProps: { session, ...rest } }) {
  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...rest} />
      </Layout>
    </SessionProvider>
  )
}
