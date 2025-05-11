import React from 'react';

const PrizePoolDisplay = ({ prizePool }) => {
  return (
    <div className="text-center my-4">
      <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500 animate-pulse drop-shadow-[0_0_6px_rgba(255,105,180,0.6)]">
        {Math.floor(prizePool)} Pi
      </h1>
      <p className="text-white/90 text-lg italic mt-2">
        Live Prize Pool — Every Ticket Adds Pi
      </p>
    </div>
  );
};

export default PrizePoolDisplay;
