// pages/_app.js
import '../styles/globals.css'
import Layout from '../src/components/layout'

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
