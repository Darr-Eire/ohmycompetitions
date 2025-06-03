'use client';
import { DEFAULT_PICK_COUNT, DEFAULT_MAX_NUMBER } from '@data/piLotteryData';

export default function PiNumberPicker({ pickedNumbers, setPickedNumbers }) {
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
      nums.add(Math.floor(Math.random() * DEFAULT_MAX_NUMBER) + 1);
    }
    setPickedNumbers(Array.from(nums));
  };

  return (
    <>
      <div className="grid grid-cols-7 gap-1 justify-center px-2">
        {Array.from({ length: DEFAULT_MAX_NUMBER }, (_, i) => i + 1).map(num => {
          const isPicked = pickedNumbers.includes(num);
          const index = pickedNumbers.indexOf(num);
          const isBonus = index === 5;
          return (
            <button
              key={num}
              onClick={() => toggleNumber(num)}
              className={`w-9 h-9 sm:w-10 sm:h-10 text-xs sm:text-sm rounded-full font-bold transition ${
                isPicked
                  ? isBonus ? 'bg-purple-500 text-white' : 'bg-cyan-300 text-black'
                  : 'bg-[#0f172a] border border-cyan-400 text-white hover:bg-cyan-600'
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>

      <div className="mt-2 text-sm text-cyan-300 underline cursor-pointer" onClick={quickPick}>
        🔄 Quick Pick
      </div>
    </>
  );
}
