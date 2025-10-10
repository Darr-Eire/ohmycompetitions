'use client';
import React from 'react';
import { useSafeTranslation } from '../hooks/useSafeTranslation';

export default function XPSpendCard({ title, desc, cost, disabled, onRedeem }) {
  const { t } = useSafeTranslation();
  return (
    <div className={`rounded-xl border p-4 bg-[#0f172a] ${disabled ? 'border-white/10 opacity-60' : 'border-cyan-600'}`}>
      <div className="text-white font-semibold">{title}</div>
      <div className="text-sm text-white/60 mt-1">{desc}</div>
      <div className="flex items-center justify-between mt-3">
        <div className="text-cyan-300 font-bold text-sm">{t('cost', 'Cost')}: {cost} XP</div>
        <button
          className={`px-3 py-2 rounded-lg text-sm font-bold ${
            disabled ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-cyan-400 text-black hover:brightness-110'
          }`}
          disabled={disabled}
          onClick={onRedeem}
        >
          {t('redeem', 'Redeem')}
        </button>
      </div>
    </div>
  );
}
