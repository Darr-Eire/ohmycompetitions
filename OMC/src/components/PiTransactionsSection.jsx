/* --- PiTransactionsSection.jsx --- */
'use client';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function PiTransactionsSection({ userId }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [type, setType] = useState('all'); // all | entry | reward
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/pi/transactions?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const filtered = items.filter(t => type === 'all' ? true : t.type === type);

  async function resend(paymentId) {
    try {
      const res = await fetch('/api/pi/resend-completion', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ paymentId })
      });
      if (!res.ok) throw new Error('Failed');
      alert(t('resend_requested', 'Resend requested ✅'));
    } catch (e) {
      alert(e.message || t('could_not_resend', 'Could not resend'));
    }
  }

  return (
    <div className="rounded-2xl border border-cyan-600 p-4 bg-[#0f172a] space-y-3">
      <div className="flex gap-2">
        <select
          value={type}
          onChange={e=>setType(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#0b1220] text-white border border-cyan-600 text-sm"
        >
          <option value="all">{t('all', 'All')}</option>
          <option value="entry">{t('entries', 'Entries')}</option>
          <option value="reward">{t('rewards', 'Rewards')}</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center text-white/70 py-6">{t('loading', 'Loading…')}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-white/60 py-6">{t('no_transactions', 'No transactions')}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(tx => (
            <div key={tx.paymentId} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex justify-between text-sm">
                <div className="text-white font-semibold">{tx.memo || '—'}</div>
                <div className="text-cyan-300 font-bold">{tx.amount} π</div>
              </div>
              <div className="text-xs text-white/60 mt-1">
                <div>{t('status', 'Status')}: <span className="text-white/80">{tx.status}</span></div>
                <div>{t('type', 'Type')}: {tx.type}</div>
                <div>{t('payment_id', 'Payment ID')}: <span className="break-all">{tx.paymentId}</span></div>
                {tx.txId ? <div>txId: <span className="break-all">{tx.txId}</span></div> : null}
                <div>{new Date(tx.createdAt).toLocaleString()}</div>
              </div>

              {/* Only show resend for stuck/needsCompletion */}
              {tx.needsCompletion && (
                <div className="mt-2">
                  <button
                    onClick={() => resend(tx.paymentId)}
                    className="text-xs bg-amber-400 text-black font-bold px-3 py-1 rounded-lg"
                  >
                    {t('resend_server_completion', 'Resend server completion')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
