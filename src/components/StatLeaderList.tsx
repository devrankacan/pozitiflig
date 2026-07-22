"use client";

import { useState } from "react";
import type { StatLeader } from "@/data/league";
import PlayerModal, { type ModalPlayer } from "@/components/PlayerModal";

export default function StatLeaderList({
  title,
  unit,
  leaders,
  accent = "primary",
}: {
  title: string;
  unit: string;
  leaders: StatLeader[];
  accent?: "primary" | "secondary";
}) {
  const [selected, setSelected] = useState<ModalPlayer | null>(null);
  const [leader, ...rest] = leaders;
  const accentClass = accent === "primary" ? "text-accent" : "text-accent-2";

  function openFor(l: StatLeader) {
    if (!l.playerId) return;
    setSelected({ id: l.playerId, name: l.name });
  }

  return (
    <div className="pl-card flex flex-col p-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">{title}</h3>
      {leader && (
        <button
          type="button"
          onClick={() => openFor(leader)}
          disabled={!leader.playerId}
          className="mt-3 flex w-full items-baseline justify-between border-b border-border pb-3 text-left enabled:cursor-pointer enabled:hover:opacity-80"
        >
          <span className="font-semibold">{leader.name}</span>
          <span className={`text-2xl font-extrabold ${accentClass}`}>
            {leader.value}
            <span className="ml-1 text-xs font-medium text-muted">{unit}</span>
          </span>
        </button>
      )}
      <ul className="mt-2 flex flex-col divide-y divide-border">
        {rest.map((l) => (
          <li key={l.name}>
            <button
              type="button"
              onClick={() => openFor(l)}
              disabled={!l.playerId}
              className="flex w-full items-center justify-between py-2 text-left text-sm enabled:cursor-pointer enabled:hover:text-accent"
            >
              <span className="text-foreground/90">{l.name}</span>
              <span className="font-semibold text-muted">
                {l.value} {unit}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <PlayerModal player={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
