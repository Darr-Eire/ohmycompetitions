// pages/_app.js
import NextApp from 'next/app'
import { SessionProvider } from 'next-auth/react'
import Layout from '@/components/layout'
import 'styles/globals.css'
import Script from 'next/script'

class App extends NextApp {
  static async getInitialProps(appContext) {
    const appProps = await NextApp.getInitialProps(appContext)
    return { ...appProps }
  }

  render() {
    const { Component, pageProps } = this.props
    const { session } = pageProps

    // pull Pi off window after it's loaded
    return (
      <SessionProvider session={session}>
        {/* 
          1) Load the Pi SDK as early as possible
          2) Initialize it immediately on load
        */}
        <Script
          src="https://sdk.minepi.com/pi-sdk.js"
          strategy="beforeInteractive"
          onLoad={() => {
            // at this point window.Pi is guaranteed to exist
            window.Pi.init({
              version: '2.0',
              sandbox: process.env.NODE_ENV !== 'production',
            })
            console.log('✅ Pi SDK loaded & init')
          }}
        />

        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SessionProvider>
    )
  }
}

export default App
