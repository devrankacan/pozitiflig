// API verisini mevcut UI tiplerine (Match/StatLeader/PlayoffMatch) dönüştürür.
// Sofascore API'sinden veri gelmezse (anahtar yok / istek başarısız) otomatik
// olarak data/league.ts içindeki statik verilere düşer - site asla bozulmaz.

import {
  matches as staticMatches,
  golKrallari as staticGol,
  asistKrallari as staticAsist,
  kuzeyPlayoff as staticKuzeyPlayoff,
  champions as staticChampions,
  teams as staticTeams,
  type Match,
  type StatLeader,
  type PlayoffMatch,
  type Champion,
} from "@/data/league";
import {
  getLastMatches,
  getTopPlayers,
  getCupTrees,
  getStandings,
  GUNEY,
  KUZEY,
  type SofaEvent,
  type TopPlayerEntry,
  type CupTree,
} from "@/lib/sofascore";

function formatDate(timestampSeconds: number): string {
  return new Date(timestampSeconds * 1000).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function mapEvent(e: SofaEvent, league: string, idx: number): Match {
  const played = e.status.type === "finished";
  return {
    id: `${e.slug}-${idx}`,
    league,
    round: e.roundInfo ? `${e.roundInfo.round}. Hafta` : "Lig Aşaması",
    home: e.homeTeam.name,
    away: e.awayTeam.name,
    homeTeamId: e.homeTeam.id,
    awayTeamId: e.awayTeam.id,
    homeScore: played ? e.homeScore.display : null,
    awayScore: played ? e.awayScore.display : null,
    date: formatDate(e.startTimestamp),
    status: played ? "played" : "upcoming",
  };
}

async function fetchLeagueMatches(
  tournamentId: number,
  seasonId: number,
  league: string,
  limit: number,
): Promise<Match[] | null> {
  const events = await getLastMatches(tournamentId, seasonId);
  if (!events || events.length === 0) return null;
  return [...events]
    .sort((a, b) => b.startTimestamp - a.startTimestamp)
    .slice(0, limit)
    .map((e, idx) => mapEvent(e, league, idx));
}

export async function getKuzeyMatches(): Promise<Match[]> {
  const live = await fetchLeagueMatches(KUZEY.tournamentId, KUZEY.seasonId, "Kuzey Ligi", 8);
  return live ?? staticMatches.filter((m) => m.league === "Kuzey Ligi");
}

export async function getGuneyMatches(): Promise<Match[]> {
  const live = await fetchLeagueMatches(GUNEY.tournamentId, GUNEY.seasonId, "Güney Ligi", 8);
  return live ?? staticMatches.filter((m) => m.league === "Güney Ligi");
}

function mapTopPlayers(entries: TopPlayerEntry[], key: "goals" | "assists"): StatLeader[] {
  return entries
    .map((e) => ({
      name: e.player.name,
      playerId: e.player.id,
      value: e.statistics[key] ?? 0,
    }))
    .filter((l) => l.value > 0)
    .slice(0, 5);
}

export async function getGolKrallari(): Promise<StatLeader[]> {
  const topPlayers = await getTopPlayers(KUZEY.tournamentId, KUZEY.seasonId);
  if (topPlayers?.goals?.length) return mapTopPlayers(topPlayers.goals, "goals");
  return staticGol;
}

export async function getAsistKrallari(): Promise<StatLeader[]> {
  const topPlayers = await getTopPlayers(KUZEY.tournamentId, KUZEY.seasonId);
  if (topPlayers?.assists?.length) return mapTopPlayers(topPlayers.assists, "assists");
  return staticAsist;
}

const ROUND_LABELS: Record<string, string> = {
  "Round of 32": "32'lik Final",
  "Round of 16": "16'lık Final",
  Quarterfinals: "Çeyrek Final",
  Semifinals: "Yarı Final",
  Final: "Final",
};

function roundLabel(description: string): string {
  return ROUND_LABELS[description] ?? description;
}

function mapCupTree(tree: CupTree): PlayoffMatch[] {
  const result: PlayoffMatch[] = [];
  const rounds = [...tree.rounds].sort((a, b) => a.order - b.order);
  for (const round of rounds) {
    const blocks = [...round.blocks].sort((a, b) => a.order - b.order);
    for (const block of blocks) {
      if (!block.finished || block.participants.length < 2) continue;
      const [home, away] = block.participants;
      const [homeScore, awayScore] = block.result.split(":").map((n) => Number(n.trim()));
      if (Number.isNaN(homeScore) || Number.isNaN(awayScore)) continue;
      result.push({
        round: roundLabel(round.description),
        home: home.team.name,
        away: away.team.name,
        homeTeamId: home.team.id,
        awayTeamId: away.team.id,
        homeScore,
        awayScore,
      });
    }
  }
  return result;
}

export async function getKuzeyPlayoff(): Promise<PlayoffMatch[]> {
  const trees = await getCupTrees(KUZEY.tournamentId, KUZEY.seasonId);
  const tree = trees?.[0];
  if (tree) {
    const mapped = mapCupTree(tree);
    if (mapped.length > 0) return mapped;
  }
  return staticKuzeyPlayoff;
}

export async function getGuneyPlayoff(): Promise<PlayoffMatch[] | null> {
  const trees = await getCupTrees(GUNEY.tournamentId, GUNEY.seasonId);
  const tree = trees?.[0];
  if (!tree) return null;
  const mapped = mapCupTree(tree);
  return mapped.length > 0 ? mapped : null;
}

export type TeamSummary = { id?: number; name: string };

async function getAllStandingsTeams(): Promise<TeamSummary[] | null> {
  const [kuzey, guney] = await Promise.all([
    getStandings(KUZEY.tournamentId, KUZEY.seasonId),
    getStandings(GUNEY.tournamentId, GUNEY.seasonId),
  ]);

  const groups = [...(kuzey ?? []), ...(guney ?? [])];
  if (groups.length === 0) return null;

  const byName = new Map<string, TeamSummary>();
  for (const group of groups) {
    for (const row of group.rows) {
      byName.set(row.team.name, { id: row.team.id, name: row.team.name });
    }
  }
  return [...byName.values()];
}

// Statik/kürüne edilmiş verilerdeki (Şampiyonlar gibi) takım isimlerini
// canlı API'den gelen gerçek takım ID'leriyle eşleştirir - bulunamazsa
// logo yerine baş harf rozetine düşülür.
async function getTeamIdMap(): Promise<Map<string, number>> {
  const teams = await getAllStandingsTeams();
  const map = new Map<string, number>();
  if (teams) {
    for (const t of teams) {
      if (t.id) map.set(t.name, t.id);
    }
  }
  return map;
}

export async function getChampionsWithLogos(): Promise<Champion[]> {
  const idMap = await getTeamIdMap();
  if (idMap.size === 0) return staticChampions;
  return staticChampions.map((c) => ({
    ...c,
    teamId: c.teamId ?? idMap.get(c.team),
  }));
}

export async function getLiveTeams(): Promise<TeamSummary[]> {
  const teams = await getAllStandingsTeams();
  if (teams && teams.length > 0) {
    return teams.sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }
  return staticTeams.map((name) => ({ name }));
}
