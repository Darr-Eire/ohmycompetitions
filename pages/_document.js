// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Pi SDK */}
        <script src="https://sdk.minepi.com/pi-sdk.js" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.Pi?.init) Pi.init({ version: '2.0' });
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
