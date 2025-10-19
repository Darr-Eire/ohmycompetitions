"use client";
import React from "react";

type Props = {
  stage?: number;
  micro?: boolean;
  title?: string;
  entrants?: number;
  capacity?: number;
  pricePi?: number | null;
  hasTicket?: boolean;
  joinHref?: string;
  onClickJoin?: () => void;
};

function formatPi(v: number | null | undefined): string {
  if (typeof v !== "number" || Number.isNaN(v)) return "";
  return `${v.toFixed(2)} π`;
}

export default function FunnelStageCard({
  stage = 1,
  micro = false,
  title,
  entrants = 0,
  capacity = 25,
  pricePi = null,
  hasTicket = false,
  joinHref,
  onClickJoin,
}: Props) {
  const label =
    stage === 1
      ? pricePi != null
        ? `Entry: ${formatPi(pricePi)}`
        : "Open entry"
      : hasTicket
        ? "Ticket held"
        : "Advance ticket required";

  const classesBox = [
    "relative rounded-2xl border border-white/10 bg-white/5 text-white",
    micro ? "p-3 text-xs" : "p-5",
  ].join(" ");

  const btnText =
    stage === 1 ? "Enter" : hasTicket ? "Join" : "Locked";

  const btnClasses = [
    "inline-block rounded-lg bg-cyan-400 font-semibold text-black",
    micro ? "px-2 py-1 text-xs" : "px-3 py-1.5",
  ].join(" ");

  const canUseLink = Boolean(joinHref) && (stage > 1 || !onClickJoin);

  return (
    <div className={classesBox}>
      <div className={micro ? "text-[11px] text-white/60" : "text-sm text-white/60"}>
        Stage {stage}
      </div>

      <div className={micro ? "text-sm font-semibold" : "text-lg font-bold"}>
        {title || (stage === 5 ? "Final · Prize Pool" : `Stage ${stage}`)}
      </div>

      <div className={micro ? "mt-1 text-[11px] text-white/60" : "mt-2 text-sm text-white/70"}>
        {label}
      </div>

      {typeof capacity === "number" && (
        <div className={micro ? "mt-1 text-[11px] text-white/60" : "mt-2 text-sm text-white/60"}>
          {typeof entrants === "number" ? `${entrants}/${capacity} entrants` : `${capacity} capacity`}
        </div>
      )}

      <div className={micro ? "mt-2" : "mt-3"}>
        {canUseLink ? (
          <a href={joinHref!} className={btnClasses}>{btnText}</a>
        ) : (
          <button type="button" onClick={onClickJoin} className={btnClasses}>{btnText}</button>
        )}
      </div>
    </div>
  );
}