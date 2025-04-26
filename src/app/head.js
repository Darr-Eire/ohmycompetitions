export default function Head() {
    return (
      <>
        <title>OhMyCompetitions</title>
        <meta name="description" content="Pi Network competition platform" />
        {/* 1️⃣ Load the official Pi SDK synchronously */}
        <script src="https://sdk.minepi.com/pi-sdk.js"></script>
        {/* 2️⃣ Immediately initialize it */}
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
  