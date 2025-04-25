import Header from '../components/Header';
import CompetitionCard from '../components/CompetitionCard';

const competition = {
  slug: 'everyday-pioneer',
  title: 'Everyday Pioneer',
  entryFee: 0.314,
  currency: 'π',
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex justify-center items-center min-h-screen bg-gray-100">
        <CompetitionCard competition={competition} />
      </main>
    </>
  );
}
