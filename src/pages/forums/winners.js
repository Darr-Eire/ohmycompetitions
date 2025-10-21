// src/pages/competitions/winners.js
'use client';

import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaTrophy, FaPlus, FaEye, FaReply, FaClock, FaStar } from 'react-icons/fa';

/* ------------------------------ FX background ------------------------------ */
function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Aurora swirl */}
      <div className="absolute -inset-32 blur-3xl opacity-30 [background:conic-gradient(from_180deg_at_50%_50%,#00ffd5,rgba(0,255,213,.2),#0077ff,#00ffd5)] animate-[spin_40s_linear_infinite]" />
      {/* star grid */}
      <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:18px_18px]" />
      {/* drifting glows */}
      <div className="absolute -top-20 -left-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-25 bg-cyan-400 animate-[float_14s_ease-in-out_infinite]" />
      <div className="absolute -bottom-20 -right-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-20 bg-blue-500 animate-[float2_18s_ease-in-out_infinite]" />
      <style jsx global>{`
        @keyframes float {0%{transform:translate(0,0)}50%{transform:translate(12px,18px)}100%{transform:translate(0,0)}}
        @keyframes float2{0%{transform:translate(0,0)}50%{transform:translate(-16px,-14px)}100%{transform:translate(0,0)}}
      `}</style>
    </div>
  );
}

/* ------------------------------ utils ------------------------------ */
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/* ------------------------------ skeleton ------------------------------ */
function ThreadSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse">
      <div className="mx-auto w-max mb-3">
        <div className="h-5 w-28 rounded-md bg-white/10" />
      </div>
      <div className="h-6 w-3/4 mx-auto rounded bg-white/10 mb-2" />
      <div className="h-4 w-5/6 mx-auto rounded bg-white/10 mb-4" />
      <div className="flex justify-center gap-4">
        <div className="h-4 w-16 rounded bg-white/10" />
        <div className="h-4 w-16 rounded bg-white/10" />
        <div className="h-4 w-16 rounded bg-white/10" />
      </div>
    </div>
  );
}

/* ------------------------------ page ------------------------------ */
export default function WinnersPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCelebration, setNewCelebration] = useState({ title: '', body: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const res = await fetch('/api/forums/threads?category=winners', { headers: { 'cache-control': 'no-cache' } });
      const data = await res.json();
      setThreads(data.threads || []);
    } catch (err) {
      console.error('Error fetching celebrations:', err);
    }
    setLoading(false);
  };

  const handleCreateCelebration = async (e) => {
    e.preventDefault();
    if (!newCelebration.title.trim() || !newCelebration.body.trim()) {
      alert('Title and story are required');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/submit/celebration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCelebration.title,
          content: newCelebration.body,
        }),
      });

      if (res.ok) {
        setNewCelebration({ title: '', body: '' });
        setShowCreateForm(false);
        fetchThreads();
      } else {
        const error = await res.json();
        alert('❌ Error: ' + (error?.error || 'Failed to post'));
      }
    } catch {
      alert('❌ Failed to post celebration');
    }
    setCreating(false);
  };

  return (
    <>
      <Head>
        <title>Winner Celebrations | OhMyCompetitions</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <main className="relative min-h-[100svh] text-white bg-[#0f1b33]">
        <BackgroundFX />

        <section className="relative z-10 py-10 px-4">
          <div className="mx-auto w-full max-w-[min(94vw,900px)] space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
              <h1 className="inline-flex items-center gap-2 text-[22px] sm:text-[28px] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00ffd5] to-[#0077ff]">
                <FaTrophy className="text-yellow-300 drop-shadow" />
                Winner Celebrations
              </h1>
              <p className="text-white/70 text-[13px] sm:text-[14px]">
                Share your win, inspire the next Pioneer, real stories from the OMC community.
              </p>
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-center">
              <button
                onClick={() => setShowCreateForm((v) => !v)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition
                  ${showCreateForm
                    ? 'bg-white/10 text-white border border-white/20 hover:bg-white/15'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow hover:brightness-110'}`}
              >
                <FaPlus />
                {showCreateForm ? 'Cancel' : 'Share Your Win'}
              </button>
            </div>

            {/* Create Celebration Form */}
            {showCreateForm && (
              <form
                onSubmit={handleCreateCelebration}
                className="space-y-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5"
              >
                <h2 className="text-center text-cyan-300 font-bold">Celebrate Your Victory!</h2>

                <input
                  type="text"
                  value={newCelebration.title}
                  onChange={(e) => setNewCelebration({ ...newCelebration, title: e.target.value })}
                  placeholder="What did you win?"
                  className="w-full bg-white/10 text-white placeholder-white/60 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-cyan-400/70"
                  required
                />

                <textarea
                  value={newCelebration.body}
                  onChange={(e) => setNewCelebration({ ...newCelebration, body: e.target.value })}
                  placeholder="Tell us about your winning experience..."
                  className="w-full bg-white/10 text-white placeholder-white/60 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-cyan-400/70 min-h-[120px]"
                  required
                />

                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="submit"
                    disabled={creating}
                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold px-6 py-2 hover:brightness-110 active:translate-y-px transition disabled:opacity-60"
                  >
                    {creating ? 'Posting…' : 'Share Victory'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="rounded-xl border border-white/20 bg-white/10 text-white font-semibold px-6 py-2 hover:bg-white/15"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Celebrations List */}
            <div className="space-y-4">
              {loading ? (
                <div className="grid gap-4">
                  {Array.from({ length: 3 }).map((_, i) => <ThreadSkeleton key={i} />)}
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center space-y-3 rounded-2xl border border-white/10 bg-white/5 p-8">
                  <FaTrophy className="text-5xl text-yellow-400/70 mx-auto" />
                  <h3 className="text-xl font-semibold">No celebrations yet</h3>
                  <p className="text-white/70">Be the first to share a winning story!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {threads.map((thread) => (
                    <Link
                      key={thread._id}
                      href={`/forums/thread/${thread.slug}`}
                      className="block rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
                    >
                      <div className="text-center space-y-3">
                        {/* Status chip */}
                        <div className="flex justify-center">
                          <span className="whitespace-nowrap rounded-md bg-emerald-500/20 px-2 py-0.5 text-emerald-200 text-[11px] font-bold">
                            WINNER STORY
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-[18px] sm:text-[20px] font-extrabold text-purple-200 tracking-tight">
                          {thread.title}
                        </h3>

                        {/* Snippet */}
                        {thread.body && (
                          <p className="text-white/80 text-sm leading-relaxed line-clamp-2">
                            {thread.body}
                          </p>
                        )}

                        {/* Meta */}
                        <div className="flex flex-wrap justify-center items-center gap-4 text-[12px] text-white/70 pt-1">
                          <span>By {thread.author || 'Anonymous'}</span>
                          <span className="inline-flex items-center gap-1">
                            <FaClock /> {formatDate(thread.createdAt)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <FaEye /> {thread.views || 0}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <FaReply /> {thread.replyCount || 0}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <FaStar className="text-yellow-400" /> {thread.upvotes || 0}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Back Button */}
            <div className="text-center pt-4">
              <Link
                href="/forums"
                className="inline-flex items-center justify-center rounded-xl px-6 py-2 text-sm font-semibold
                           border border-white/20 bg-white/10 text-white hover:bg-white/15 transition"
              >
                Back to Forums
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
