'use client';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { postJSON } from '../../lib/api';
import { usePiAuth } from '../../context/PiAuthContext';
import FunnelCompetitionCard from '../../components/FunnelCompetitionCard';
import FreeCompetitionCard from '../../components/FreeCompetitionCard';
import LaunchCompetitionDetailCard from '../../components/LaunchCompetitionDetailCard';

export default function CompetitionDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { user } = usePiAuth();

  const [type, setType] = useState('none');
  const [comp, setComp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return;
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr(null);
      setType('none');
      setComp(null);

      try {
        // 1) Try funnel
        let r = await fetch(`/api/funnel/${slug}`);
        if (r.ok) {
          const data = await r.json();
          if (!cancelled) {
            setType('funnel');
            setComp(data);
            setLoading(false);
          }
          return;
        }
        if (r.status !== 404) {
          const msg = await r.text().catch(() => 'Funnel fetch failed');
          throw new Error(msg || `Funnel endpoint error (${r.status})`);
        }

        // 2) Try admin competitions
        r = await fetch(`/api/competitions/${slug}`);
        if (r.ok) {
          const data = await r.json();
          if (!cancelled) {
            setType('competition');
            setComp(data);
            setLoading(false);
          }
          return;
        }

        if (r.status === 404) {
          if (!cancelled) {
            setType('none');
            setComp(null);
            setLoading(false);
          }
          return;
        }
        const msg2 = await r.text().catch(() => 'Competition fetch failed');
        throw new Error(msg2 || `Competition endpoint error (${r.status})`);

      } catch (e) {
        if (!cancelled) {
          setErr(e);
          setLoading(false);
        }
      }
    }

    run();
    return () => { cancelled = true; };
  }, [slug]);

  if (!slug || loading) return <PageWrap><Loader /></PageWrap>;
  if (err || !comp || type === 'none') return <PageWrap><ErrorBox /></PageWrap>;

  // Funnel UI
  if (type === 'funnel') {
    const canJoin =
      comp.stage === 1 && comp.status === 'filling' && comp.entrantsCount < comp.capacity;

    async function onJoin() {
      if (!user?.id && !user?.piUserId) return alert('Login required.');
      try {
        await postJSON('/api/funnel/join', { slug, userId: user?.id || user?.piUserId });
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

  // Admin-created competition object
 // Admin-created competition UI
const adminComp = {
  slug: comp.slug,
  startsAt: comp.startsAt || '',
  endsAt: comp.endsAt || '',
  ticketsSold: comp.ticketsSold ?? comp.entrantsCount ?? 0,
  totalTickets: comp.totalTickets ?? comp.capacity ?? 0,
  comingSoon: Boolean(comp.comingSoon),
  status: comp.status || 'active',
  title: comp.title || 'Competition',
  prizeLabel: comp.prizeLabel || comp.prize || '',
  imageUrl: comp.imageUrl || '/pi.jpeg',
  entryFee: comp.entryFee ?? 0,
  theme: comp.theme || '',
  winners: comp.winners || 'Multiple',           // <-- added
  maxTicketsPerUser: comp.maxTicketsPerUser || 'N/A', // <-- added
};

return (
  <PageWrap>
    <div className="max-w-3xl mx-auto w-full">
      {adminComp.theme.toLowerCase() === 'launch' ? (
        <LaunchCompetitionDetailCard
          comp={adminComp}
          title={adminComp.title}
          prize={adminComp.prizeLabel}
          fee={`${(adminComp.entryFee).toFixed(2)} π`}
          imageUrl={adminComp.imageUrl}
          startsAt={adminComp.startsAt}
          endsAt={adminComp.endsAt}
          ticketsSold={adminComp.ticketsSold}
          totalTickets={adminComp.totalTickets}
          status={adminComp.status}
        />
      ) : (
        <FreeCompetitionCard
          comp={adminComp}
          title={adminComp.title}
          prize={adminComp.prizeLabel}
          buttonLabel="Enter"
        />
      )}
    </div>
  </PageWrap>
);


  return (
    <PageWrap>
      <div className="max-w-3xl mx-auto w-full">
        {adminComp.theme.toLowerCase() === 'launch' ? (
          <LaunchCompetitionDetailCard
            comp={adminComp}
            title={adminComp.title}
            prize={adminComp.prizeLabel}
            fee={`${adminComp.entryFee.toFixed(2)} π`}
            imageUrl={adminComp.imageUrl}
            startsAt={adminComp.startsAt}
            endsAt={adminComp.endsAt}
            ticketsSold={adminComp.ticketsSold}
            totalTickets={adminComp.totalTickets}
            status={adminComp.status}
          />
        ) : (
          <FreeCompetitionCard
            comp={adminComp}
            title={adminComp.title}
            prize={adminComp.prizeLabel}
            buttonLabel="Enter"
          />
        )}
      </div>
    </PageWrap>
  );
}

export async function getServerSideProps() {
  return { props: {} };
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
