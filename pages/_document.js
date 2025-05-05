// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* 1) Load the Pi SDK as soon as the page starts parsing */}
          <script src="https://sdk.minepi.com/pi-sdk.js" async />

          {/* 2) Initialize it immediately on load */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (window.Pi) {
                  window.Pi.init({
                    version: "2.0",
                    sandbox: ${process.env.NODE_ENV !== 'production'}
                  });
                  console.log("✅ Pi SDK loaded & initialized");
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
