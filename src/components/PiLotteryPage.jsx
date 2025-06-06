'use client';
import { useState, useEffect } from 'react';

const DEFAULT_PICK_COUNT = 6;
const DEFAULT_MAX_NUMBER = 49;

const countryData = {
  NG: { name: 'Nigeria', flag: '🇳🇬' },
  IN: { name: 'India', flag: '🇮🇳' },
  VN: { name: 'Vietnam', flag: '🇻🇳' },
  US: { name: 'United States', flag: '🇺🇸' },
  KR: { name: 'South Korea', flag: '🇰🇷' },
  ID: { name: 'Indonesia', flag: '🇮🇩' },
  PH: { name: 'Philippines', flag: '🇵🇭' },
  IE: { name: 'Ireland', flag: '🇮🇪' },
  PK: { name: 'Pakistan', flag: '🇵🇰' },
  BD: { name: 'Bangladesh', flag: '🇧🇩' },
  KE: { name: 'Kenya', flag: '🇰🇪' },
  BR: { name: 'Brazil', flag: '🇧🇷' }
};

const getFlag = (code) => countryData[code]?.flag || '🏳️';
const getCountryName = (code) => countryData[code]?.name || code;

export default function PiLotteryPage() {
  const [lotteryType, setLotteryType] = useState('global');
  const [countryCode, setCountryCode] = useState('IE');
  const [pickedNumbers, setPickedNumbers] = useState([]);
  const [drawCountdown, setDrawCountdown] = useState('Loading...');
  const max = DEFAULT_MAX_NUMBER;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const nextDraw = new Date();
      nextDraw.setUTCHours(0, 0, 0, 0);
      nextDraw.setUTCDate(nextDraw.getUTCDate() + (lotteryType === 'global' ? (7 - nextDraw.getUTCDay()) : 1));
      const diff = nextDraw - now;
      const hours = Math.floor(diff / 1000 / 60 / 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setDrawCountdown(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [lotteryType]);

  const toggleNumber = (num) => {
    if (pickedNumbers.includes(num)) {
      setPickedNumbers(pickedNumbers.filter(n => n !== num));
    } else if (pickedNumbers.length < DEFAULT_PICK_COUNT) {
      setPickedNumbers([...pickedNumbers, num]);
    }
  };

  const quickPick = () => {
    const nums = new Set();
    while (nums.size < DEFAULT_PICK_COUNT) {
      nums.add(Math.floor(Math.random() * max) + 1);
    }
    setPickedNumbers(Array.from(nums));
  };

  const handleSubmit = async () => {
    if (pickedNumbers.length !== DEFAULT_PICK_COUNT) {
      return alert("Pick all numbers");
    }

    if (typeof window === 'undefined' || !window.Pi || typeof window.Pi.createPayment !== 'function') {
      alert('⚠️ Pi SDK not ready.');
      return;
    }

    const mainNumbers = pickedNumbers.slice(0, 5);
    const bonusNumber = pickedNumbers[5];

    try {
      window.Pi.createPayment(
        {
          amount: 1.0,
          memo: `Pi Lottery Ticket`,
          metadata: {
            type: 'pi-lottery-ticket',
            mainNumbers,
            bonusNumber,
            countryCode,
            lotteryType
          },
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            try {
              const res = await fetch('/api/pi-lottery/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId }),
              });
              if (!res.ok) throw new Error(await res.text());
              console.log('[✅] Payment approved');
            } catch (err) {
              console.error('[ERROR] Approving payment:', err);
              alert('❌ Server approval failed.');
            }
          },

          onReadyForServerCompletion: async (paymentId, txid) => {
            try {
              const res = await fetch('/api/pi-lottery/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid, mainNumbers, bonusNumber, countryCode }),
              });
              if (!res.ok) throw new Error(await res.text());
              const data = await res.json();
              alert(`✅ Ticket purchased! 🎟️ Ticket ID: ${data.ticketId}`);
            } catch (err) {
              console.error('[ERROR] Completing payment:', err);
              alert('❌ Server completion failed.');
            }
          },

          onCancel: (paymentId) => {
            console.warn('[APP] Payment cancelled:', paymentId);
          },

          onError: (error, payment) => {
            console.error('[APP] Payment error:', error, payment);
          },
        }
      );
    } catch (err) {
      console.error('Pi Payment failed', err);
      alert('Payment failed or cancelled');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-6 font-orbitron">
      {/* Your full existing page remains here */}
      {/* Replace only handleSubmit() logic like above */}
    </div>
  );
}
