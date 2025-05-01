// pages/_app.js
import { SessionProvider } from 'next-auth/react'
import Layout from '@/components/layout'
import '../styles/globals.css'
import Script from 'next/script'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      {/* Load the Pi SDK */}
      <Script
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="beforeInteractive"
      />

      {/* Initialize it: sandbox = dev, disabled in prod */}
      <Script
        id="pi-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if (window.Pi) {
              window.Pi.init({
                version: "2.0",
                sandbox: ${process.env.NODE_ENV !== 'production'}
              });
            }
          `,
        }}
      />

      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  )
}
