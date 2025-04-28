// pages/try-your-luck.js
'use client'

export default function TryYourLuck() {
  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-6">
      {/* Title */}
      <h1 className="text-4xl font-bold text-blue-500 text-center mb-8 mt-8">
        🎲 Try Your Luck!
      </h1>

      {/* Game Cards */}
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 w-full max-w-4xl">
        {/* Scratch Card */}
        <div className="competition-card">
          <h2 className="comp-title">Scratch Card</h2>
          <p className="comp-prize">Reveal hidden prizes!</p>
          <button className="comp-button">Play Now</button>
        </div>

        {/* Spin the Wheel */}
        <div className="competition-card">
          <h2 className="comp-title">Spin the Wheel</h2>
          <p className="comp-prize">Spin for rewards!</p>
          <button className="comp-button">Spin Now</button>
        </div>

        {/* Launch Pi to the Moon */}
        <div className="competition-card">
          <h2 className="comp-title">Launch Pi to the Moon</h2>
          <p className="comp-prize">Tap at the right time!</p>
          <button className="comp-button">Launch Now</button>
        </div>
      </div>
    </main>
  )
}

