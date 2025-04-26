// src/app/head.js
import Script from 'next/script';

export default function Head() {
  return (
    <>
      <title>OhMyCompetitions</title>
      <meta name="description" content="Pi Network competition platform" />
      {/* Load the Pi JS widget early */}
      <Script
        src="https://sdk.minepi.com/widget.js"
        strategy="beforeInteractive"
      />
    </>
  );
}
