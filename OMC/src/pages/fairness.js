import Layout from '../components/Layout';

export default function FairnessPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold">Fairness & Transparency</h1>
        <p className="text-gray-300">We publish how winners are chosen and expose verifiable ticket IDs.</p>
        <div className="space-y-2 text-sm">
          <h2 className="text-xl font-semibold">Ticket IDs</h2>
          <p>Each entry generates a unique ticket number (e.g., T123..., GIFT-..., XP-...). These are stored on your tickets and shown on results pages.</p>
          <h2 className="text-xl font-semibold mt-4">Winner Selection</h2>
          <p>Winners are selected from completed payments/tickets using a random selection algorithm. The process is logged in admin and winners list is saved in each competition document.</p>
          <h2 className="text-xl font-semibold mt-4">Future Enhancements</h2>
          <ul className="list-disc pl-6">
            <li>Public seed and hash of the selection for independent verification.</li>
            <li>Published proof file with drawn ticket numbers and timestamps.</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}


