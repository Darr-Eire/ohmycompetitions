// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Pi SDK */}
        <script
          async
          src="https://sdk.minepi.com/pi-sdk.js"
        />
        <script
          // once pi-sdk.js is loaded, initialize it
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof Pi !== 'undefined') {
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
  )
}
