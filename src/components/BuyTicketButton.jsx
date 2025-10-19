'use client';
import { useState, useEffect } from 'react';
import { useUserTicketLimits } from '../hooks/useUserTicketLimits';
import { usePiAuth } from '../context/PiAuthContext';
import { useToast } from '../context/ToastContext';
import { usePiEnv } from '../hooks/usePiEnv';
import { safeInitPi } from '../lib/pi/initPi';
import { usePiPurchase } from '../hooks/usePiPurchase';

export default function BuyTicketButton({
  competitionSlug,
  entryFee,
  quantity = 1,
  onPaymentSuccess,
  endsAt,
  competition,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const limits = useUserTicketLimits(competitionSlug, competition);
  const { user, login: loginWithPi } = usePiAuth(); // ← use context user
  const { showSuccess, showError, showWarning } = useToast();
  const { isPiBrowser, hasPi, isReady } = usePiEnv();
  const { purchase } = usePiPurchase();

  useEffect(() => {
    if (isPiBrowser && hasPi) safeInitPi();
  }, [isPiBrowser, hasPi]);

  const isCompetitionEnded = () => {
    if (!endsAt) return false;
    return new Date() > new Date(endsAt);
  };

  const handleBuyTicket = async () => {
    try {
      if (isCompetitionEnded()) {
        showWarning('This competition has ended.');
        return;
      }

      if (!isPiBrowser || !hasPi) {
        showWarning('Open in Pi Browser to continue.');
        return;
      }

      // ensure logged in
      if (!user) {
        const r = await loginWithPi();
        if (!r || r.ok === false) return; // user cancelled or failed
      }

      setLoading(true);
      setError(null);

      const qty = Number(quantity) || 1;
      const price = Number(entryFee) || 1;
      const amount = qty * price;
      const memo = `OMC ticket x${qty} for ${competitionSlug}`;

      await purchase({
        amount,
        memo,
        onApproved: () => console.debug('[BuyTicket] approved'),
        onCompleted: () => {
          onPaymentSuccess?.();
          showSuccess('Payment complete. Tickets added!');
        },
      });
    } catch (e) {
      console.error('[BuyTicket] error:', e);
      const msg = e?.message || 'Payment failed';
      setError(msg);
      showError(msg);
      // Optional: alert for now so you see the exact message on device
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      disabled={loading}
      onClick={handleBuyTicket}
      className="btn btn-primary"
      aria-busy={loading ? 'true' : 'false'}
    >
      {loading ? 'Processing…' : `Pay With π`}
    </button>
  );
}