import { useEffect, useState } from 'react';

export default function Ticker() {
  const [messages, setMessages] = useState([]);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/ticker');
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error('Failed to fetch ticker messages:', error);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setFade(true);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div className="h-10 w-full flex items-center justify-center overflow-hidden">
      <div
        className={`text-cyan-300 font-orbitron text-xs sm:text-sm text-center transition-opacity duration-500 ease-in-out ${
          fade ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ whiteSpace: 'nowrap' }}
      >
        {messages[index]}
      </div>
    </div>
  );
}
