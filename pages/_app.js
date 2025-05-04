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
        <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="beforeInteractive" />
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
}

export default App
