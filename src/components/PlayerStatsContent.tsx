"use client";

import { useEffect, useState } from "react";

type StatsPayload = {
  team: string | null;
  year: string;
  stats: {
    goals: number;
    assists: number;
    appearances: number;
    minutesPlayed: number;
    yellowCards: number;
    redCards: number;
  };
};

type Status = "loading" | "success" | "error";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-surface-2 p-3">
      <p className="text-xl font-extrabold text-accent">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

export default function PlayerStatsContent({
  playerId,
  teamName,
}: {
  playerId: number;
  teamName?: string;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<StatsPayload | null>(null);

  useEffect(() => {
    const query = teamName ? `?team=${encodeURIComponent(teamName)}` : "";
    fetch(`/api/player-stats/${playerId}${query}`)
      .then((res) => {
        if (!res.ok) throw new Error("no data");
        return res.json() as Promise<StatsPayload>;
      })
      .then((json) => {
        setData(json);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [playerId, teamName]);

  if (status === "loading") {
    return <p className="py-4 text-center text-sm text-muted">Yükleniyor...</p>;
  }

  if (status === "error" || !data) {
    return <p className="py-4 text-center text-sm text-muted">İstatistik bulunamadı.</p>;
  }

  const { stats } = data;

  return (
    <div>
      {data.team && (
        <p className="mb-3 text-center text-xs text-muted">
          {data.team} · {data.year}
        </p>
      )}
      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label="Gol" value={stats.goals} />
        <Stat label="Asist" value={stats.assists} />
        <Stat label="Maç" value={stats.appearances} />
        <Stat label="Dakika" value={stats.minutesPlayed} />
        <Stat label="Sarı Kart" value={stats.yellowCards} />
        <Stat label="Kırmızı Kart" value={stats.redCards} />
      </div>
    </div>
  );
}
