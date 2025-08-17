import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Lock the site’s color scheme so WebViews (X, FB, IG) don’t auto-darken */}
        <meta name="color-scheme" content="dark light" />
        <meta name="supported-color-schemes" content="dark" />

        {/* Make the browser/status bar match your background */}
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#0a1024"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#0a1024"
        />

        {/* iOS Safari status bar */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        {/* Expose ENV config to browser */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window._ENV = {
                backendURL: "${process.env.NEXT_PUBLIC_BACKEND_URL || ''}",
                sandbox: "${process.env.NEXT_PUBLIC_PI_SANDBOX || 'true'}",
                piAppId: "${process.env.NEXT_PUBLIC_PI_APP_ID || ''}"
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
                const appId = window._ENV?.piAppId;
                
                console.log("🔧 Pi SDK Environment:", { sandbox, appId });
                
                if (window.Pi && appId) {
                  try {
                    window.Pi.init({ version: "2.0", sandbox, appId });
                    console.log("✅ Pi SDK initialized");
                  } catch (err) {
                    console.error("❌ Pi SDK init error:", err);
                  }
                } else {
                  console.warn("⚠️ Pi SDK not loaded or missing app ID:", { 
                    piLoaded: !!window.Pi, 
                    appId 
                  });
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
