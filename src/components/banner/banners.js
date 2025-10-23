'use client';

import React from 'react';

/* --------------------------------- Launch Week Banner --------------------------------- */
export function LaunchWeekBanner({ title = 'Launch Week Prize', prizeText = 'TBA' }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-pink-500/30 shadow-[0_0_30px_#ec489933]">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-fuchsia-600 to-purple-700" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff3_1px,transparent_1px)] bg-[22px_22px]" />

      <div className="absolute inset-0 flex items-center justify-center opacity-5 text-white text-[200px] font-bold select-none">🚀</div>

      <div className="absolute -inset-10 opacity-20 blur-2xl pointer-events-none">
        <div className="absolute left-1/4 top-1/4 w-64 h-64 rounded-full bg-pink-400/40" />
        <div className="absolute right-1/4 bottom-1/4 w-72 h-72 rounded-full bg-purple-300/30" />
      </div>

      <div className="absolute inset-0 ring-1 ring-pink-300/30 shadow-[0_0_50px_#ec489955_inset]" />

      <div className="relative h-full w-full flex items-center justify-center text-center px-4">
        <div className="select-none">
          <h3 className="text-yellow-300 text-[15px] sm:text-[17px] font-extrabold leading-tight drop-shadow">
            {title}
          </h3>
          <p className="mt-1 text-white/80 text-[13px] font-medium">{prizeText}</p>
        </div>
      </div>
    </div>
  );
}
export function PiPrizeBanner({ title = 'Pi Competition', prizeText = 'TBA', feeText = '—' }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-yellow-400/20 shadow-[0_0_30px_#fde68a33]">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-400 to-amber-500" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff3_1px,transparent_1px)] bg-[22px_22px]" />
      <div className="absolute inset-0 flex items-center justify-center opacity-5 text-white text-[200px] font-bold select-none">
        π
      </div>
      <div className="relative h-full w-full flex items-center justify-center text-center px-4">
        <div className="select-none">
          <h3 className="text-white text-[15px] sm:text-[17px] font-extrabold leading-tight drop-shadow line-clamp-2">
            {title}
          </h3>
          <p className="mt-1 text-white/90 text-[13px] font-medium">
            {prizeText} Prize • Entry: {feeText}
          </p>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Daily Banner --------------------------------- */
export function DailyBanner({ title = 'Daily Prize', prizeText = 'TBA' }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-cyan-500/30 shadow-[0_0_30px_#06b6d433]">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff3_1px,transparent_1px)] bg-[22px_22px]" />

      <div className="absolute inset-0 flex items-center justify-center opacity-5 text-white text-[200px] font-bold select-none">☀️</div>

      <div className="absolute -inset-10 opacity-20 blur-2xl pointer-events-none">
        <div className="absolute left-1/4 top-1/4 w-64 h-64 rounded-full bg-cyan-400/40" />
        <div className="absolute right-1/4 bottom-1/4 w-72 h-72 rounded-full bg-blue-300/30" />
      </div>

      <div className="absolute inset-0 ring-1 ring-cyan-300/30 shadow-[0_0_50px_#06b6d455_inset]" />

      <div className="relative h-full w-full flex items-center justify-center text-center px-4">
        <div className="select-none">
          <h3 className="text-white text-[15px] sm:text-[17px] font-extrabold leading-tight drop-shadow">
            {title}
          </h3>
          <p className="mt-1 text-white/80 text-[13px] font-medium">{prizeText}</p>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- OMC Banner --------------------------------- */
export function OMCBanner({ title = 'OMC Special', prizeText = 'TBA', feeText = '—' }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-purple-500/30 shadow-[0_0_30px_#9f7aea33]">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-800 via-indigo-700 to-black" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff3_1px,transparent_1px)] bg-[22px_22px]" />
      <div className="absolute inset-0 flex items-center justify-center opacity-5 text-white text-[200px] font-bold select-none">π</div>

      <div className="absolute -inset-10 opacity-20 blur-2xl pointer-events-none">
        <div className="absolute left-1/4 top-1/4 w-64 h-64 rounded-full bg-purple-400/40" />
        <div className="absolute right-1/4 bottom-1/4 w-72 h-72 rounded-full bg-yellow-300/30" />
      </div>

      <div className="absolute inset-0 ring-1 ring-purple-300/30 shadow-[0_0_50px_#c084fc55_inset]" />

      <div className="relative h-full w-full flex items-center justify-center text-center px-4">
        <div className="select-none">
          <h3 className="text-yellow-300 text-[15px] sm:text-[17px] font-extrabold leading-tight drop-shadow line-clamp-2">
            {title}
          </h3>
          <p className="mt-1 text-white/80 text-[13px] font-medium">
            {prizeText} Prize • Entry: {feeText}
          </p>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Generic Prize Banner --------------------------------- */
export function PrizeBanner({ title = 'Prize', prizeText = 'TBA', feeText = '' }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#00ffd5] via-[#00b7ff] to-[#005eff]" />
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.7)_1.5px,transparent_1.5px)] [background-size:22px_22px]" />

      <div className="absolute -inset-10 opacity-30 blur-2xl pointer-events-none">
        <div className="absolute left-1/3 top-1/3 w-72 h-72 rounded-full bg-cyan-300/40" />
        <div className="absolute right-1/4 bottom-1/4 w-72 h-72 rounded-full bg-blue-400/40" />
      </div>

      <div className="absolute inset-0 ring-1 ring-white/20 shadow-[0_0_50px_#22d3ee66_inset]" />

      <div className="relative h-full w-full flex items-center justify-center text-center px-3">
        <div className="max-w-[86%] select-none">
          <div className="text-black drop-shadow-[0_3px_14px_rgba(255,255,255,0.7)]">
            <div className="inline-flex items-baseline gap-1 rounded-2xl bg-white/35 px-3 py-1.5 ring-1 ring-white/60 shadow-[0_8px_28px_rgba(34,211,238,0.55)]">
              <span className="text-[20px] sm:text-[28px] font-black leading-none tracking-tight">
                {prizeText}
              </span>
            </div>
          </div>

          <h3 className="mt-2 mx-auto w-full text-center text-[14px] sm:text-[16px] font-extrabold leading-snug text-black/90 line-clamp-2">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
}
