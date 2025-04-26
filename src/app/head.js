// src/app/head.js
export default function Head() {
    return (
      <>
        <title>OhMyCompetitions</title>
        <meta name="description" content="Pi Network competition platform" />
  
        {/* Pi Browser SDK */}
        <script src="https://sdk.minepi.com/pi-sdk.js" />
  
        {/* Initialize the Pi SDK */}
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
  