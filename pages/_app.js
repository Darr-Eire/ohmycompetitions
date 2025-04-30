// pages/_app.js
import { SessionProvider } from 'next-auth/react'
import Layout from '@/components/layout'
import '../styles/globals.css'
import Script from 'next/script'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      {/* ✅ Pi SDK Script using next/script */}
      <Script
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="beforeInteractive"
      />
      <Script
        id="pi-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.Pi && Pi.init({ version: '2.0' });
          `,
        }}
      />

      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  )
}
