// components/Timer.js

import { useState, useEffect } from "react";

export default function Timer({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const difference = expiry - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
      } else {
        setTimeLeft(difference);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = ((time % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div>
      {timeLeft > 0 ? (
        <p>Time remaining: {formatTime(timeLeft)}</p>
      ) : (
        <p>Time has expired!</p>
      )}
    </div>
  );
}
