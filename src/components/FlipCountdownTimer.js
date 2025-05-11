import React from 'react';
import FlipClockCountdown from '@leenguyen/react-flip-clock-countdown';
import '@leenguyen/react-flip-clock-countdown/dist/index.css';

const FlipCountdownTimer = ({ to }) => {
  return (
    <div className="flex justify-center my-6">
      <FlipClockCountdown
        to={to}
        labels={['DAYS', 'HOURS', 'MINUTES', 'SECONDS']}
        labelStyle={{
          fontSize: 10,
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 1,
          color: '#9CA3AF', // Tailwind slate-400
        }}
        digitBlockStyle={{
          width: 48,
          height: 68,
          fontSize: 32,
          fontWeight: 'bold',
          backgroundColor: '#111827', // Tailwind gray-900
          color: '#ec4899', // Tailwind pink-500
          borderRadius: 6,
          boxShadow: '0 0 8px rgba(236, 72, 153, 0.4)',
        }}
        dividerStyle={{ color: '#ec4899' }}
        separatorStyle={{ color: '#ec4899' }}
      />
    </div>
  );
};

export default FlipCountdownTimer;
