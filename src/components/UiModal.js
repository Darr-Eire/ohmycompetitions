'use client';
import { useEffect } from 'react';

export default function UiModal({ open, onClose, title, children }) {
  // lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* panel: sheet on mobile, centered card on desktop */}
      <div className="absolute inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2
                      sm:-translate-x-1/2 sm:-translate-y-1/2
                      sm:w-[640px] w-full max-h-[85vh] sm:max-h-[80vh]
                      rounded-t-2xl sm:rounded-2xl border border-white/10
                      bg-[#0b1220] shadow-xl overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">{title || 'Terms & Conditions'}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg px-2 py-1 text-white/80 hover:bg-white/10"
          >✕</button>
        </div>

        {/* content */}
        <div className="p-4 overflow-y-auto text-sm leading-6 text-white/90 space-y-3">
          {children}
        </div>

        {/* footer */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-2 font-semibold text-black"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
