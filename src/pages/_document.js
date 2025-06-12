import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Pi ENV config for browser access */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window._ENV = {
                backendURL: "${process.env.NEXT_PUBLIC_BACKEND_URL || ''}",
                sandbox: "${process.env.NEXT_PUBLIC_SANDBOX_SDK || 'true'}"
              };
            `,
          }}
        />
        {/* Load Pi SDK */}
        <script src="https://sdk.minepi.com/pi-sdk.js"></script>

        {/* Initialize Pi SDK */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                const sandboxMode = window._ENV?.sandbox === "true";
                window.Pi?.init({ version: "2.0", sandbox: sandboxMode });
              })();
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
