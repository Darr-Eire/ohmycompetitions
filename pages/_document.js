import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Pi Network SDK (Sandbox Mode) */}
          <script
            src="https://sdk.minepi.com/pi-sdk.js"
            data-version="2.0"
            data-sandbox="true"
          ></script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

