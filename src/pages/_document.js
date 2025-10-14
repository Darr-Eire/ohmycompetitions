// File: src/pages/_document.jsx
// Purpose: Ensure Pi SDK is present in the browser (Pi Browser or not).
import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Why: Guarantee window.Pi exists – Pi Browser injects it, but we also load official SDK */}
          <script
            src="https://sdk.minepi.com/pi-sdk.js"
            // keep attributes minimal, SDK is small and must be available ASAP
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
