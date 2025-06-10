// src/pages/_document.js

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Pi Network SDK */}
       <script src="https://sdk.minepi.com/pi-sdk.js" defer></script>

    
      </Head>
      <body className="bg-black text-white font-orbitron">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
