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
  type StandingsGroup,
  type StandingsRow,
} from "@/lib/sofascore";

// Puan Durumu sayfasında puan tablosu + o gruba ait maç sonuçlarını aynı
// sütunda göstermek için kullanılan sabit anahtar - hem canlı API'den
// gelen bölümler hem de yedek Sofascore widget'ları bu anahtarla eşleşir.
export type LeagueGroupKey = "kuzey" | "guney-a" | "guney-b" | "guney";

// Güney Ligi'nin Grup A / Grup B ayrımı standings uç noktasında
// `tournament.name` alanına bakılarak belirlenir (aynı yöntem maç
// sonuçlarında da kullanılıyor). Kuzey Ligi tek grup olduğu için her
// zaman "Kuzey Ligi" etiketiyle döner.
function guneyGroupInfo(group: StandingsGroup): { key: LeagueGroupKey; label: string } {
  if (group.tournament.name.includes("Group A")) {
    return { key: "guney-a", label: "Güney Ligi — Grup A" };
  }
  if (group.tournament.name.includes("Group B")) {
    return { key: "guney-b", label: "Güney Ligi — Grup B" };
  }
  return { key: "guney", label: "Güney Ligi" };
}

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

// Güney Ligi, Grup A ve Grup B olmak üzere iki gruba ayrılır. Sofascore
// tarafındaki tüm Güney maçları tek bir tournamentId altında toplandığı için
// (get-standings'te olduğu gibi) her maç etkinliğindeki `tournament.name`
// alanına bakarak hangi gruba ait olduğunu belirliyoruz. API grup bilgisi
// döndürmezse (veya erişilemezse) statik/ayrıştırılamamış maçlar "ungrouped"
// içinde döner ve sayfa bunu tek bir "Güney Ligi" bölümü olarak gösterir.
export type GuneyMatchGroups = {
  groupA: Match[];
  groupB: Match[];
  ungrouped: Match[];
};

export async function getGuneyMatchGroups(): Promise<GuneyMatchGroups> {
  const events = await getLastMatches(GUNEY.tournamentId, GUNEY.seasonId);
  if (!events || events.length === 0) {
    return {
      groupA: [],
      groupB: [],
      ungrouped: staticMatches.filter((m) => m.league === "Güney Ligi"),
    };
  }

  const eventKey = (e: SofaEvent) => `${e.slug}-${e.startTimestamp}`;
  const groupAEvents = events.filter((e) => e.tournament?.name?.includes("Group A"));
  const groupBEvents = events.filter((e) => e.tournament?.name?.includes("Group B"));
  const groupedKeys = new Set([...groupAEvents, ...groupBEvents].map(eventKey));
  const restEvents = events.filter((e) => !groupedKeys.has(eventKey(e)));

  const toMatches = (list: SofaEvent[]) =>
    [...list]
      .sort((a, b) => b.startTimestamp - a.startTimestamp)
      .slice(0, 8)
      .map((e, idx) => mapEvent(e, "Güney Ligi", idx));

  const hasGroupInfo = groupAEvents.length > 0 || groupBEvents.length > 0;

  return {
    groupA: toMatches(groupAEvents),
    groupB: toMatches(groupBEvents),
    ungrouped: hasGroupInfo ? [] : toMatches(restEvents),
  };
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

async function fetchAllStandingsGroups(): Promise<{
  kuzey: StandingsGroup[] | null;
  guney: StandingsGroup[] | null;
}> {
  const [kuzey, guney] = await Promise.all([
    getStandings(KUZEY.tournamentId, KUZEY.seasonId),
    getStandings(GUNEY.tournamentId, GUNEY.seasonId),
  ]);
  return { kuzey, guney };
}

async function getAllStandingsTeams(): Promise<TeamSummary[] | null> {
  const { kuzey, guney } = await fetchAllStandingsGroups();
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

// Puan Durumu sayfasındaki tabloları besler - Kuzey Ligi ve Güney
// Ligi'nin Grup A/Grup B'si ayrı ayrı, doğru etiketlerle döner. API
// erişilemezse null döner; sayfa bu durumda eski Sofascore iframe
// widget'larına düşer.
export type StandingsSection = { group: LeagueGroupKey; title: string; rows: StandingsRow[] };

export async function getStandingsSections(): Promise<StandingsSection[] | null> {
  const { kuzey, guney } = await fetchAllStandingsGroups();
  if ((!kuzey || kuzey.length === 0) && (!guney || guney.length === 0)) return null;

  const sections: StandingsSection[] = [];
  for (const group of kuzey ?? []) {
    sections.push({
      group: "kuzey",
      title: "Kuzey Ligi",
      rows: [...group.rows].sort((a, b) => a.position - b.position),
    });
  }
  for (const group of guney ?? []) {
    const info = guneyGroupInfo(group);
    sections.push({
      group: info.key,
      title: info.label,
      rows: [...group.rows].sort((a, b) => a.position - b.position),
    });
  }
  return sections;
}

// Takımlar sayfasını besler - takımlar Kuzey Ligi / Güney Ligi Grup A /
// Güney Ligi Grup B olarak ayrı bölümlerde döner. API erişilemezse
// statik takım listesi tek bir bölüm olarak döner.
export type TeamGroup = { title: string; teams: TeamSummary[] };

export async function getLiveTeamGroups(): Promise<TeamGroup[]> {
  const { kuzey, guney } = await fetchAllStandingsGroups();
  if ((!kuzey || kuzey.length === 0) && (!guney || guney.length === 0)) {
    return [{ title: "Takımlar", teams: staticTeams.map((name) => ({ name })) }];
  }

  const toTeams = (group: StandingsGroup): TeamSummary[] =>
    [...group.rows]
      .sort((a, b) => a.team.name.localeCompare(b.team.name, "tr"))
      .map((r) => ({ id: r.team.id, name: r.team.name }));

  const groups: TeamGroup[] = [];
  for (const group of kuzey ?? []) {
    groups.push({ title: "Kuzey Ligi", teams: toTeams(group) });
  }
  for (const group of guney ?? []) {
    groups.push({ title: guneyGroupInfo(group).label, teams: toTeams(group) });
  }
  return groups;
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

