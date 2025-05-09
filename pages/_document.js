// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    const isSandbox = process.env.NODE_ENV !== 'production'

    return (
      <Html>
        <Head>
          <script
            src="https://sdk.minepi.com/pi-sdk.js"
            data-version="2.0"
            data-sandbox={isSandbox}
          ></script>

          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.addEventListener('load', function () {
                  if (window.Pi && typeof window.Pi.init === 'function') {
                    window.Pi.init({
                      version: "2.0",
                      sandbox: ${isSandbox}
                    });
                    console.log("✅ Pi SDK initialized");
                  } else {
                    console.warn("❌ Pi SDK not available yet");
                  }
                });
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
