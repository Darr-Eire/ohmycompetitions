// src/pages/competitions/try-your-luck.js
'use client';

import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getStreak } from 'lib/streak';
import { miniGames as games } from '@data/minigames';

export default function TryYourLuckPage() {
  const [streak, setStreak] = useState(0);
  const [playedMap, setPlayedMap] = useState({});
  const [resetCountdown, setResetCountdown] = useState('');

  useEffect(() => {
    setStreak(getStreak());
    refreshPlayedMap();
    const cleanup = startCountdown();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refreshPlayedMap() {
    const map = {};
    games.forEach((g) => {
      map[g.storageKey] = Boolean(localStorage.getItem(g.storageKey));
    });
    setPlayedMap(map);
  }

  function startCountdown() {
    const getNextMidnight = () => {
      const now = new Date();
      const next = new Date(now);
      next.setUTCHours(0, 0, 0, 0);
      next.setUTCDate(next.getUTCDate() + 1);
      return next;
    };

    const update = () => {
      const now = new Date();
      const diff = getNextMidnight() - now;
      const hours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
      const mins = Math.max(0, Math.floor((diff / (1000 * 60)) % 60));
      setResetCountdown(`${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`);
    };

    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }

  return (
    <>
      <Head>
        <title>Try Your Luck | OhMyCompetitions</title>
      </Head>

      <main className="relative min-h-screen text-white font-orbitron">
        {/* Subtle radial background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[#0b1326]" />
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[90vw] h-[90vw] max-w-[900px] max-h-[900px] rounded-full blur-[120px] opacity-25"
               style={{ background: 'radial-gradient(60% 60% at 50% 50%, #22d3ee55 0%, transparent 60%)' }} />
        </div>

        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-12">
          {/* Hero / Title card */}
          <div className="rounded-3xl border border-cyan-500/40 bg-white/[0.03] backdrop-blur-md shadow-[0_0_50px_rgba(34,211,238,0.25)] p-5 sm:p-7">
            <div className="flex flex-col items-center gap-3 text-center">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide">
                <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow">
                  Try Your Luck
                </span>
              </h1>

              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                Win free tickets, unlock daily rewards, spin for mystery prizes, and rack up piles of{' '}
                <span className="font-bold">π</span> every day!
              </p>

              {/* Streak + Reset row */}
              <div className="mt-1 flex flex-col sm:flex-row items-center gap-3">
                <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-emerald-200 text-sm font-semibold shadow-[0_0_18px_rgba(16,185,129,0.25)]">
                  🔥 Daily Streak: <span className="text-white">{streak}</span> day{streak === 1 ? '' : 's'}
                </div>
                <div className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-cyan-200 text-sm font-semibold">
                  ⏱ Next reset in: <span className="text-white">{resetCountdown}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Games grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {games.map((game) => {
              const hasPlayed = playedMap[game.storageKey];
              return (
                <div
                  key={game.href}
                  className="
                    group relative overflow-hidden rounded-2xl border border-cyan-500/30
                    bg-gradient-to-br from-[#122034]/70 to-[#0b1326]/70 backdrop-blur
                    shadow-[0_10px_30px_rgba(0,0,0,0.35)]
                    transition-transform duration-200 hover:-translate-y-[2px]
                  "
                >
                  {/* top accent line */}
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 opacity-70" />

                  <div className="p-5">
                    {/* Title + status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl drop-shadow">{game.icon}</span>
                        <h2 className="text-xl font-bold">{game.title}</h2>
                      </div>

                      <span
                        className="
                          rounded-full px-3 py-1 text-[11px] font-bold
                          border border-amber-400/40 bg-amber-400/15 text-amber-200
                          animate-pulse
                        "
                      >
                        Coming Soon
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mt-2 text-[13px] text-white/85 leading-relaxed">
                      {game.desc}
                    </p>

                    {/* Played today badge */}
                    <div className="mt-3">
                      {hasPlayed ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-200">
                          ✅ Played today
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/80">
                          🎯 Ready when live
                        </span>
                      )}
                    </div>

                    {/* Disabled CTA */}
                    <button
                      disabled
                      aria-label="Play Now (disabled)"
                      className="
                        mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold
                        cursor-not-allowed
                        border border-white/15
                        bg-gradient-to-r from-slate-600/40 to-slate-700/40
                        text-white/60
                      "
                    >
                      Play Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Idea box */}
          <div className="mt-10 rounded-2xl border border-cyan-500/30 bg-white/[0.04] backdrop-blur p-6 text-center shadow-[0_0_28px_rgba(34,211,238,0.18)]">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
              Got an Idea for a New Mini Game?
            </h2>
            <p className="text-sm text-white/80 max-w-2xl mx-auto">
              We&apos;re building more games! Got a fun idea or a cultural favourite from your country?
              Reach out anytime.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <SocialLink href="https://x.com/OhMyComps" label="@OM_Competitions" platform="X / Twitter" />
              <SocialLink href="https://instagram.com/ohmycompetitions" label="@ohmycompetitions" platform="Instagram" />
              <SocialLink
                href="https://www.facebook.com/profile.php?id=61577406478876"
                label="Oh My Competitions"
                platform="Facebook"
              />
            </div>
          </div>

          {/* Terms link */}
          <div className="mt-8 text-center">
            <Link
              href="/terms-conditions"
              className="text-xs text-cyan-300 underline hover:text-cyan-200 transition"
            >
              View full Terms & Conditions
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function SocialLink({ href, label, platform }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="
        block rounded-xl border border-cyan-400/30 bg-cyan-400/10
        px-4 py-2 text-sm text-cyan-200 hover:text-white
        hover:bg-cyan-400/15 transition-colors text-center
      "
      title={platform}
    >
      {platform}: <span className="font-semibold">{label}</span>
    </a>
  );
}
