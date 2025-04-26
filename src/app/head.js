// src/app/head.js
export default function Head() {
    return (
      <>
        <title>OhMyCompetitions</title>
        <meta name="description" content="Pi Network competition platform" />
  
        {/* Load the official Pi Apps SDK synchronously */}
        <script src="https://sdk.minepi.com/pi-sdk.js"></script>
  
        {/* Immediately initialize it */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof Pi !== 'undefined' && typeof Pi.init === 'function') {
                Pi.init({ version: '2.0' });
              }
            `,
          }}
        />
      </>
    );
  }
  