// lib/useCountdown.js
import { useEffect, useState } from 'react';

export default function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  function getTimeLeft(end) {
    const total = Date.parse(end) - Date.now();
    return {
      total,
      days: Math.floor(total / (1000 * 60 * 60 * 24)),
      hours: Math.floor((total / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((total / 1000 / 60) % 60),
      seconds: Math.floor((total / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = getTimeLeft(targetDate);
      setTimeLeft(newTime);
      if (newTime.total <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}
