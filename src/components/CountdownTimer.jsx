import React, { useEffect, useState } from 'react';
import FlipClockUnit from './FlipClockUnit';

export default function CountdownTimer({ targetTime }) {
  const [timeLeft, setTimeLeft] = useState(getTimeDiff());

  function getTimeDiff() {
    const now = new Date();
    const diff = Math.max(0, targetTime - now);
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeDiff());
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return (
    <div className="flex gap-4 justify-center mt-4">
      {Object.entries(timeLeft).map(([label, value]) => (
        <FlipClockUnit key={label} value={String(value).padStart(2, '0')} label={label} />
      ))}
    </div>
  );
}
