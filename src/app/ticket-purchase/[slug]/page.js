'use client';

import Header from '../../../components/Header';
import TicketPurchaseForm from '../../../components/TicketPurchaseForm';

const competition = {
  title: 'My Competition',
  slug: 'my-competition',
  // …other props…
};

export default function Page({ params }) {
  return (
    <>
      <Header />
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{competition.title}</h1>
        <TicketPurchaseForm competition={competition} />
      </main>
    </>
  );
}
