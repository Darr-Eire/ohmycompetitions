// file: src/pages/competitions/[slug].jsx
'use client';

import { useRouter } from 'next/router';
import { useFunnelDetail } from '@hooks/useFunnel';
import { postJSON } from '@lib/api';
import { usePiAuth } from '@context/PiAuthContext';
import FunnelCompetitionCard from '../../components/FunnelCompetitionCard';
export default function CompetitionDetailPage() {
  const router = useRouter();
  const { slug } = router.query;

  // Avoid firing the hook with undefined slug
  const { user } = usePiAuth();
  const { comp, isLoading, error, mutate } = useFunnelDetail(
    typeof slug === 'string' ? slug : undefined
  );

  if (!slug) return <PageWrap><Loader /></PageWrap>;
  if (isLoading) return <PageWrap><Loader /></PageWrap>;
  if (error || !comp) return <PageWrap><ErrorBox /></PageWrap>;

  const canJoin =
    comp.stage === 1 && comp.status === 'filling' && comp.entrantsCount < comp.capacity;

  async function onJoin() {
    if (!user?.id && !user?.piUserId) return alert('Login required.');
    try {
      await postJSON('/api/funnel/join', { slug, userId: user?.id || user?.piUserId });
      await mutate();
      alert('Joined! 🍀');
    } catch (e) {
      alert(e?.message || 'Join failed');
    }
  }

  return (
    <PageWrap>
      <FunnelCompetitionCard
        title={`Funnel — Stage ${comp.stage}`}
        stage={comp.stage}
        compId={comp.slug}
        entrants={comp.entrantsCount}
        capacity={comp.capacity}
        advancing={comp.advancing}
        status={comp.status}
        imageUrl={comp.imageUrl || '/pi.jpeg'}
        hasTicket={false}
        onClickJoin={canJoin ? onJoin : undefined}
        tags={[String(comp.status || '').toUpperCase()]}
      />
    </PageWrap>
  );
}

function PageWrap({ children }) {
  return <div className="min-h-screen bg-[#070d19] p-6 text-white">{children}</div>;
}
function Loader() {
  return <div className="h-56 rounded-2xl bg-white/5 animate-pulse" />;
}
function ErrorBox() {
  return (
    <div className="rounded-xl border border-rose-500/30 bg-white/5 text-white/80 p-6">
      Competition not found.
    </div>
  );
}
