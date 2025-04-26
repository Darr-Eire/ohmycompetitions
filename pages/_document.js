// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Load the Pi Browser SDK */}
        <script src="https://sdk.minepi.com/pi-sdk.js" />
        {/* Initialize it immediately */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof Pi !== 'undefined' && Pi.init) {
                Pi.init({ version: "2.0" });
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
