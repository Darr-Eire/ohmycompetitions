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

    return (
      <SessionProvider session={session}>
       {/* 1) Load Pi SDK before React mounts */}
        <Script
          src="https://sdk.minepi.com/pi-sdk.js"
          strategy="beforeInteractive"
        />
     {/* 2) Immediately init it before hydration */}
        <Script
          id="pi-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.Pi.init({
                version: "2.0",
                sandbox: ${process.env.NODE_ENV !== 'production'}
              });
              console.log("✅ Pi SDK initialized");
            `,
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
