// pages/_app.js
import Layout from '../src/components/layout'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
