// src/app/head.js
export default function Head() {
    return (
      <>
        {/* INJECTED-BY-HEAD.JS */}
        <title>OhMyCompetitions</title>
        <meta name="description" content="Pi Network competition platform" />
        <script src="https://sdk.minepi.com/pi-sdk.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.Pi?.init) {
                Pi.init({ version: '2.0' });
              }
            `,
          }}
        />
      </>
    );
  }
  