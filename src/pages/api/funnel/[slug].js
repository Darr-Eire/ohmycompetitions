'use client';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { usePiAuth } from '../../context/PiAuthContext.js';
import FunnelCompetitionCard from '../../components/FunnelCompetitionCard.js';

export default function CompetitionDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { user } = usePiAuth();
  const [comp, setComp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/funnel/live?stage=1`)
      .then(res => res.json())
      .then(data => {
        const found = [...data.filling, ...data.live].find(c => c.slug === slug);
        if (!found) setError(true);
        else setComp(found);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  const canJoin =
    comp?.stage === 1 && comp?.status === 'filling' && comp?.entrantsCount < comp?.capacity;

  async function onJoin() {
    if (!user?.id && !user?.piUserId) return alert('Login required.');
    try {
      await fetch('/api/funnel/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, userId: user?.id || user?.piUserId })
      });
      alert('Joined! 🍀');
    } catch {
      alert('Join failed');
    }
  }

  if (loading) return <PageWrap><Loader /></PageWrap>;
  if (error || !comp) return <PageWrap><ErrorBox /></PageWrap>;

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
        tags={[comp.status.toUpperCase()]}
      />
    </PageWrap>
  );
}

function PageWrap({ children }) {
  return <div className="min-h-screen bg-[#070d19] p-6">{children}</div>;
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
