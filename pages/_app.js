// pages/_app.js
import Head from 'next/head'
import Layout from '@/components/layout'
import '@/styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <script src="https://sdk.minepi.com/pi-sdk.js" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.Pi && Pi.init({ version: '2.0' });`,
          }}
        />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}
