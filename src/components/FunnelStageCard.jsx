"use client";
import React from "react";

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
}) {
  const label =
    stage === 1
      ? (pricePi != null ? `Entry: ${pricePi} π` : "Open entry")
      : hasTicket
        ? "Ticket held"
        : "Advance ticket required";

  const Container = ({ children }) => (
    <div
      className={[
        "relative rounded-2xl border border-white/10 bg-white/5 text-white",
        micro ? "p-3 text-xs" : "p-5",
      ].join(" ")}
    >
      {children}
    </div>
  );

  const JoinButton = () => {
    const text =
      stage === 1 ? "Enter" : hasTicket ? "Join" : "Locked";

    const classes = [
      "inline-block rounded-lg bg-cyan-400 font-semibold text-black",
      micro ? "px-2 py-1 text-xs" : "px-3 py-1.5",
    ].join(" ");

    if (joinHref && (!onClickJoin || stage > 1)) {
      return (
        <a href={joinHref} className={classes}>
          {text}
        </a>
      );
    }
    return (
      <button type="button" onClick={onClickJoin} className={classes}>
        {text}
      </button>
    );
  };

  return (
    <Container>
      <div className={micro ? "text-[11px] text-white/60" : "text-sm text-white/60"}>
        Stage {stage}
      </div>

      <div className={micro ? "text-sm font-semibold" : "text-lg font-bold"}>
        {title || (stage === 5 ? "Final · Prize Pool" : `Stage ${stage}`)}
      </div>

      <div className={micro ? "mt-1 text-[11px] text-white/60" : "mt-2 text-sm text-white/70"}>
        {label}
      </div>

      <div className={micro ? "mt-1 text-[11px] text-white/60" : "mt-2 text-sm text-white/60"}>
        {capacity ? `${entrants}/${capacity} entrants` : null}
      </div>

      <div className={micro ? "mt-2" : "mt-3"}>
        <JoinButton />
      </div>
    </Container>
  );
}