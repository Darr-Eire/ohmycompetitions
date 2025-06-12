import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Expose ENV config to browser */}
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

        {/* Pi SDK script */}
        <script src="https://sdk.minepi.com/pi-sdk.js"></script>

        {/* Pi SDK initialization script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                const sandbox = window._ENV?.sandbox === "true";
                if (window.Pi) {
                  window.Pi.init({ version: "2.0", sandbox });
                  console.log("✅ Pi SDK initialized");
                } else {
                  console.warn("⚠️ Pi SDK not loaded");
                }
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
