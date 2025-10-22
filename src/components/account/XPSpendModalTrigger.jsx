import { useState, useEffect } from "react";
import Link from "next/link";

export default function XPSpendModalTrigger({ userId, username }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ items: [] });

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        // TODO: replace with your API endpoint when ready
        const json = {
          items: [
            { slug: "pi-stages", title: "Pi Stages", how: "Convert XP → extra entries", href: "/competitions/pi-stages" },
            { slug: "pi-cash-code", title: "Pi Cash Code", how: "Spend XP to reveal hints", href: "/pi-cash-code" },
            { slug: "try-your-skill", title: "Try Your Skill", how: "XP → bonus / lower fee", href: "/games/try-your-skill" },
          ],
        };
        if (!ignore) setData(json);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/40 bg-[#0b1220] px-3 py-2 text-cyan-200 hover:bg-[#0e172a]"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Where can I spend XP?
      </button>

      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-xl border border-cyan-400/30 bg-[#0b1220] p-5 shadow-xl">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-cyan-100">Spend XP</h2>
                  <p className="text-sm text-cyan-200/70">
                    {username ? `@${username}` : "Your account"} · ID: {userId?.slice?.(0, 6) ?? "—"}
                  </p>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-lg px-2 py-1 text-cyan-200 hover:bg-white/5">✕</button>
              </div>

              {loading ? (
                <p className="text-cyan-200/80">Loading options…</p>
              ) : (
                <ul className="space-y-3">
                  {data.items.map((it) => (
                    <li key={it.slug} className="rounded-lg border border-cyan-400/20 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-cyan-100">{it.title}</p>
                          <p className="text-sm text-cyan-200/70">{it.how}</p>
                        </div>
                        <Link
                          href={it.href}
                          className="rounded-md border border-cyan-400/40 px-3 py-1 text-sm text-cyan-200 hover:bg-white/5"
                          onClick={() => setOpen(false)}
                        >
                          Open
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-cyan-400/10 pt-4">
                <Link href="/account/xp" className="text-sm text-cyan-300 underline-offset-2 hover:underline">
                  View XP history
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-cyan-400/40 px-3 py-2 text-cyan-200 hover:bg-white/5"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
