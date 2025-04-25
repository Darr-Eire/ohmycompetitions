'use client';

import Header from '../../../../components/Header';
import TicketPurchaseForm from '../../../../components/TicketPurchaseForm';

const competition = {
  slug: 'everyday-pioneer',
  title: 'Everyday Pioneer',
  entryFee: 0.314,
  currency: 'π',
};

export default function TicketPage({ params }) {
  const handleSuccess = () => {
    window.location.href = '/success';
  };

  return (
    <>
      <Header />
      <main className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">{competition.title}</h1>
        <TicketPurchaseForm competition={competition} onSuccess={handleSuccess} />
      </main>
    </>
  );
}
