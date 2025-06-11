import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Pi ENV global */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window._ENV = {
                backendURL: "${process.env.NEXT_PUBLIC_BACKEND_URL}",
                sandbox: "${process.env.NEXT_PUBLIC_SANDBOX_SDK}"
              };
            `,
          }}
        />
        {/* Pi SDK */}
        <script src="https://sdk.minepi.com/pi-sdk.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const runSandbox = window._ENV.sandbox === "true";
              window.Pi.init({ version: "2.0", sandbox: runSandbox });
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
