// src/app/head.js
export default function Head() {
    return (
      <>
        <title>OhMyCompetitions</title>
        <meta name="description" content="Pi Network competition platform" />
  
        {/* Pi SDK: must be loaded in Pi Browser only */}
        <script src="https://sdk.minepi.com/pi-sdk.js" async defer></script>
        <script
          // Inline init; use sandbox flag in dev if you like
          dangerouslySetInnerHTML={{
            __html: `
              if (window.Pi && typeof window.Pi.init === 'function') {
                Pi.init({ version: "2.0" });
              }
            `,
          }}
        />
      </>
    );
  }
  