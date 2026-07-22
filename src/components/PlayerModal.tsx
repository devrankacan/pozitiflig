"use client";

import { useEffect } from "react";
import PlayerAvatar from "@/components/PlayerAvatar";
import PlayerStatsContent from "@/components/PlayerStatsContent";

export type ModalPlayer = {
  id: number;
  name: string;
  jerseyNumber?: string;
  position?: string;
};

const POSITION_LABELS: Record<string, string> = {
  G: "Kaleci",
  D: "Defans",
  M: "Orta Saha",
  F: "Forvet",
};

export default function PlayerModal({
  player,
  teamName,
  onClose,
}: {
  player: ModalPlayer | null;
  teamName?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!player) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [player, onClose]);

  if (!player) return null;

  const meta = [
    player.jerseyNumber && `#${player.jerseyNumber}`,
    player.position && (POSITION_LABELS[player.position] ?? player.position),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div className="pl-card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <PlayerAvatar playerId={player.id} name={player.name} size={56} />
            <div className="min-w-0">
              <p className="truncate font-bold">{player.name}</p>
              {meta && <p className="text-xs text-muted">{meta}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="shrink-0 rounded-full p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-5">
          <PlayerStatsContent key={player.id} playerId={player.id} teamName={teamName} />
        </div>
      </div>
    </div>
  );
}
