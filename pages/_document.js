// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    const sandbox = process.env.NODE_ENV !== 'production'
    return (
      <Html>
        <Head>
          {/* 1) Load the Pi SDK as early as possible */}
          <script src="https://sdk.minepi.com/pi-sdk.js"></script>
          {/* 2) Initialize it immediately on load */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (window.Pi && typeof window.Pi.init === 'function') {
                  window.Pi.init({
                    version: "2.0",
                    sandbox: ${sandbox}
                  });
                  console.log("✅ Pi SDK initialized");
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
    )
  }
}
