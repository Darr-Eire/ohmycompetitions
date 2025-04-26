// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Pi SDK: load and initialize before React */}
          <script src="https://sdk.minepi.com/pi-sdk.js"></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (window.Pi && typeof window.Pi.init === 'function') {
                  Pi.init({ version: '2.0' });
                }
              `,
            }}
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
