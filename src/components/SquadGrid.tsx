"use client";

import { useState } from "react";
import type { SquadPlayer } from "@/lib/sofascore";
import PlayerAvatar from "@/components/PlayerAvatar";
import PlayerModal, { type ModalPlayer } from "@/components/PlayerModal";

const POSITION_LABELS: Record<string, string> = {
  G: "Kaleci",
  D: "Defans",
  M: "Orta Saha",
  F: "Forvet",
};
const POSITION_ORDER = ["G", "D", "M", "F"];

function jerseySort(a: SquadPlayer, b: SquadPlayer): number {
  const na = Number(a.jerseyNumber);
  const nb = Number(b.jerseyNumber);
  const va = Number.isFinite(na) ? na : 999;
  const vb = Number.isFinite(nb) ? nb : 999;
  return va - vb;
}

function calcAge(timestampSeconds: number | null): number | null {
  if (!timestampSeconds) return null;
  const ageMs = Date.now() - timestampSeconds * 1000;
  const age = Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000));
  return age > 0 && age < 100 ? age : null;
}

export default function SquadGrid({
  players,
  teamName,
}: {
  players: SquadPlayer[];
  teamName: string;
}) {
  const [selected, setSelected] = useState<ModalPlayer | null>(null);

  return (
    <div className="flex flex-col gap-8">
      {POSITION_ORDER.map((code) => {
        const group = players.filter((p) => p.position === code).sort(jerseySort);
        if (group.length === 0) return null;
        return (
          <div key={code}>
            <h3 className="mb-3 text-lg font-bold text-accent">
              {POSITION_LABELS[code] ?? code}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((p) => {
                const age = calcAge(p.dateOfBirthTimestamp);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      setSelected({
                        id: p.id,
                        name: p.name,
                        jerseyNumber: p.jerseyNumber,
                        position: p.position,
                      })
                    }
                    className="pl-card flex items-center gap-3 p-4 text-left transition-colors hover:border-accent"
                  >
                    <div className="relative shrink-0">
                      <PlayerAvatar playerId={p.id} name={p.name} size={44} />
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-background ring-2 ring-surface">
                        {p.jerseyNumber || "-"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{p.name}</p>
                      {age && <p className="text-xs text-muted">{age} yaşında</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <PlayerModal player={selected} teamName={teamName} onClose={() => setSelected(null)} />
    </div>
  );
}
