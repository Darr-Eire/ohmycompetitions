// src/pages/_document.tsx (or app/layout.tsx in App Router)
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
      <script
  src="https://sdk.minepi.com/pi-sdk.js"
  async
></script>

        <script dangerouslySetInnerHTML={{
          __html: `Pi.init({ version: "2.0" })`
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
