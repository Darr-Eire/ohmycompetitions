// src/app/head.js

export default function Head() {
    return (
      <>
        <title>OhMyCompetitions</title>
        <meta name="description" content="Pi Network competition platform" />
        {/* Load Pi widget SDK early via raw script tag */}
        <script
          src="https://sdk.minepi.com/widget.js"
          async
          defer
        />
      </>
    );
  }
  