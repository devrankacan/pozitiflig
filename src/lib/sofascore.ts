// Sofascore verisi (RapidAPI üzerinden) - SADECE sunucu tarafında kullanılır.
// API anahtarı hiçbir zaman istemciye (tarayıcıya) gönderilmez.
//
// Kota koruması: yanıtlar bu process'in belleğinde SOFASCORE_REVALIDATE_SECONDS
// süresince önbelleklenir. API anahtarı tanımlı değilse ya da istek başarısız
// olursa fonksiyonlar null döner; çağıran taraf statik verilere düşer.

const API_HOST = "sofascore.p.rapidapi.com";
const API_KEY = process.env.SOFASCORE_RAPIDAPI_KEY;
const REVALIDATE_MS = Number(process.env.SOFASCORE_REVALIDATE_SECONDS ?? 43200) * 1000;

export const GUNEY = { tournamentId: 27221, seasonId: 98003 };
export const KUZEY = { tournamentId: 34326, seasonId: 93435 };

type CacheEntry<T> = { data: T; fetchedAt: number };
const cache = new Map<string, CacheEntry<unknown>>();

async function sofaGet<T extends object>(
  path: string,
  revalidateMs: number = REVALIDATE_MS,
): Promise<T | null> {
  if (!API_KEY) return null;

  const cached = cache.get(path) as CacheEntry<T> | undefined;
  const now = Date.now();
  if (cached && now - cached.fetchedAt < revalidateMs) {
    return cached.data;
  }

  try {
    const res = await fetch(`https://${API_HOST}${path}`, {
      headers: {
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": API_KEY,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      throw new Error(`Sofascore API ${res.status} - ${path}`);
    }

    const data = (await res.json()) as T;
    cache.set(path, { data, fetchedAt: now });
    return data;
  } catch (err) {
    console.error("[sofascore] fetch failed:", path, err);
    // Eski (süresi dolmuş) veri varsa, hiç veri olmamasından iyidir.
    if (cached) return cached.data;
    return null;
  }
}

export type SofaTeam = {
  id: number;
  name: string;
  shortName: string;
  slug: string;
  nameCode: string;
};

export type StandingsRow = {
  id: number;
  team: SofaTeam;
  position: number;
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  scoresFor: number;
  scoresAgainst: number;
  points: number;
};

export type StandingsGroup = {
  tournament: { name: string; slug: string };
  rows: StandingsRow[];
};

type StandingsResponse = { standings: StandingsGroup[] };

export type SofaEvent = {
  slug: string;
  homeTeam: SofaTeam;
  awayTeam: SofaTeam;
  homeScore: { current: number; display: number };
  awayScore: { current: number; display: number };
  startTimestamp: number;
  status: { code: number; description: string; type: string };
  roundInfo?: { round: number };
};

type EventsResponse = { events: SofaEvent[] };

export type TopPlayerEntry = {
  statistics: { goals?: number; assists?: number; appearances: number };
  player: { id: number; name: string; shortName: string; slug: string; position: string };
};

type TopPlayersResponse = {
  topPlayers: {
    goals?: TopPlayerEntry[];
    assists?: TopPlayerEntry[];
  };
};

export type CupTreeParticipant = { team: SofaTeam; winner: boolean; order: number };
export type CupTreeBlock = {
  finished: boolean;
  order: number;
  result: string;
  participants: CupTreeParticipant[];
};
export type CupTreeRound = { order: number; description: string; blocks: CupTreeBlock[] };
export type CupTree = { id: number; name: string; rounds: CupTreeRound[] };
type CupTreesResponse = { cupTrees: CupTree[] };

export async function getStandings(
  tournamentId: number,
  seasonId: number,
): Promise<StandingsGroup[] | null> {
  const data = await sofaGet<StandingsResponse>(
    `/tournaments/get-standings?tournamentId=${tournamentId}&seasonId=${seasonId}&type=total`,
  );
  return data?.standings ?? null;
}

export async function getLastMatches(
  tournamentId: number,
  seasonId: number,
): Promise<SofaEvent[] | null> {
  const data = await sofaGet<EventsResponse>(
    `/tournaments/get-last-matches?tournamentId=${tournamentId}&seasonId=${seasonId}&pageIndex=0`,
  );
  return data?.events ?? null;
}

export async function getTopPlayers(
  tournamentId: number,
  seasonId: number,
): Promise<TopPlayersResponse["topPlayers"] | null> {
  const data = await sofaGet<TopPlayersResponse>(
    `/tournaments/get-top-players?tournamentId=${tournamentId}&seasonId=${seasonId}`,
  );
  return data?.topPlayers ?? null;
}

export async function getCupTrees(
  tournamentId: number,
  seasonId: number,
): Promise<CupTree[] | null> {
  const data = await sofaGet<CupTreesResponse>(
    `/tournaments/get-cuptrees?tournamentId=${tournamentId}&seasonId=${seasonId}`,
  );
  return data?.cupTrees ?? null;
}

type SquadPlayerRaw = {
  id: number;
  name: string;
  shortName: string;
  position: string;
  jerseyNumber: string;
  dateOfBirthTimestamp: number | null;
  team?: { name: string };
};

type SquadResponse = { players: { player: SquadPlayerRaw }[] };

export type SquadPlayer = {
  id: number;
  name: string;
  shortName: string;
  position: string;
  jerseyNumber: string;
  dateOfBirthTimestamp: number | null;
};

export type Squad = { teamName: string; players: SquadPlayer[] };

// Kadrolar sezon içinde neredeyse hiç değişmediği için maç/istatistik
// verisinden çok daha uzun bir önbellek süresi kullanılır (varsayılan 7 gün).
const SQUAD_REVALIDATE_MS =
  Number(process.env.SOFASCORE_SQUAD_REVALIDATE_SECONDS ?? 604800) * 1000;

export async function getSquad(teamId: number): Promise<Squad | null> {
  const data = await sofaGet<SquadResponse>(
    `/teams/get-squad?teamId=${teamId}`,
    SQUAD_REVALIDATE_MS,
  );
  if (!data?.players || data.players.length === 0) return null;

  const teamName = data.players[0].player.team?.name ?? "";
  const players: SquadPlayer[] = data.players.map((p) => ({
    id: p.player.id,
    name: p.player.name,
    shortName: p.player.shortName,
    position: p.player.position,
    jerseyNumber: p.player.jerseyNumber,
    dateOfBirthTimestamp: p.player.dateOfBirthTimestamp,
  }));

  return { teamName, players };
}

// Görseller (takım/oyuncu logosu) neredeyse hiç değişmediği için ayrı ve
// çok daha uzun bir önbellek süresi kullanılır (varsayılan 30 gün) - kotayı
// gereksiz yormaz.
type ImageEntry = { bytes: ArrayBuffer; contentType: string; fetchedAt: number };
const imageCache = new Map<string, ImageEntry>();
const IMAGE_REVALIDATE_MS =
  Number(process.env.SOFASCORE_LOGO_REVALIDATE_SECONDS ?? 2592000) * 1000;

async function sofaGetImage(cacheKey: string, path: string): Promise<ImageEntry | null> {
  if (!API_KEY) return null;

  const cached = imageCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.fetchedAt < IMAGE_REVALIDATE_MS) {
    return cached;
  }

  try {
    const res = await fetch(`https://${API_HOST}${path}`, {
      headers: {
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": API_KEY,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      throw new Error(`Sofascore image API ${res.status} - ${path}`);
    }

    const bytes = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/png";
    const entry: ImageEntry = { bytes, contentType, fetchedAt: now };
    imageCache.set(cacheKey, entry);
    return entry;
  } catch (err) {
    console.error("[sofascore] image fetch failed:", path, err);
    if (cached) return cached;
    return null;
  }
}

export async function getTeamLogo(teamId: number): Promise<ImageEntry | null> {
  return sofaGetImage(`team-${teamId}`, `/teams/get-logo?teamId=${teamId}`);
}

export async function getPlayerImage(playerId: number): Promise<ImageEntry | null> {
  return sofaGetImage(`player-${playerId}`, `/players/get-image?playerId=${playerId}`);
}

export type PlayerSeasonStats = {
  goals: number;
  assists: number;
  appearances: number;
  minutesPlayed: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  tackles: number;
  interceptions: number;
  cleanSheet: number;
};

export type PlayerStatSeasonEntry = {
  statistics: PlayerSeasonStats;
  year: string;
  team?: { name: string };
};

type AllStatisticsResponse = { seasons: PlayerStatSeasonEntry[] };

export async function getPlayerStatistics(
  playerId: number,
): Promise<PlayerStatSeasonEntry[] | null> {
  const data = await sofaGet<AllStatisticsResponse>(
    `/players/get-all-statistics?playerId=${playerId}`,
  );
  return data?.seasons ?? null;
}
