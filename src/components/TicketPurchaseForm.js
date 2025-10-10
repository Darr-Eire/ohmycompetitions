'use client';

import { useState } from 'react';
import { useSafeTranslation } from '../hooks/useSafeTranslation';

export default function TicketPurchaseForm({ competition }) {
  const { t } = useSafeTranslation();
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: replace with real purchase logic (e.g. API call)
    alert('🔔 createPayment called')
   console.log('🛒 createPayment start', { entryFee, competitionSlug })
    alert(t('purchased_tickets', `Purchased ${quantity} ticket(s) for ${competition.title}!`));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto space-y-6 bg-white p-6 rounded shadow"
    >
      <div>
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-gray-700"
        >
          {t('quantity', 'Quantity')}
        </label>
        <input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      <div className="text-lg font-semibold">
        {t('total', 'Total')}: {quantity * competition.entryFee} {competition.currency}
      </div>

      <button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded"
      >
        {t('pay', 'Pay')} {quantity * competition.entryFee} {competition.currency}
      </button>
    </form>
  );
}
