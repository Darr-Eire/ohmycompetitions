// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Pi Network SDK */}
        <script src="https://sdk.minepi.com/pi-sdk.js" />
        <script
          // the dangerouslySetInnerHTML is required in Next.js _document
          dangerouslySetInnerHTML={{
            __html: `
              Pi.init({ version: "2.0" });
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
