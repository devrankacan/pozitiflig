// Sofascore verisi (RapidAPI üzerinden) - SADECE sunucu tarafında kullanılır.
// API anahtarı hiçbir zaman istemciye (tarayıcıya) gönderilmez.
//
// Kota koruması: yanıtlar önce bu process'in belleğinde, ayrıca diskte
// (SOFASCORE_CACHE_DIR) SOFASCORE_REVALIDATE_SECONDS süresince önbelleklenir.
// Disk önbelleği, deploy/restart sonrası bellek sıfırlansa bile veriyi korur -
// böylece her restart RapidAPI kotasını yeniden tüketmez. Süresi dolmuş bir
// veri bile olsa, yeni istek başarısız olursa hiç veri olmamasından iyidir,
// bu yüzden geri döndürülür. API anahtarı tanımlı değilse ya da hem canlı
// istek hem de disk önbelleği başarısız olursa fonksiyonlar null döner;
// çağıran taraf statik verilere düşer.
//
// Maç sonuçları için ek olarak uyarlanabilir bir yenileme sıklığı var:
// devam eden ya da başlamış olabilecek bir maç varsa (bkz. getLastMatches)
// veri çok daha sık (SOFASCORE_LIVE_REVALIDATE_SECONDS, varsayılan 2 dakika)
// yenilenir; aksi halde günde bir kez yenilenerek kota korunur.

import { promises as fs } from "fs";
import path from "path";
import { createHash } from "crypto";

const API_HOST = "sofascore.p.rapidapi.com";
const API_KEY = process.env.SOFASCORE_RAPIDAPI_KEY;
// Boşta (canlı maç yokken) kullanılan varsayılan yenileme süresi - 24 saat.
// Amatör ligde maç günleri haftada bir olduğu için bu gecikme kullanıcı
// tarafında fark edilmez, ama RapidAPI'nin 500 istek/ay ücretsiz kotasında
// standings/top-players/cuptrees/maçlar için rahat bir pay bırakır.
const REVALIDATE_MS = Number(process.env.SOFASCORE_REVALIDATE_SECONDS ?? 86400) * 1000;

const CACHE_DIR = process.env.SOFASCORE_CACHE_DIR
  ? path.resolve(process.env.SOFASCORE_CACHE_DIR)
  : path.join(process.cwd(), ".data", "sofascore-cache");
const JSON_CACHE_DIR = path.join(CACHE_DIR, "json");
const IMAGE_CACHE_DIR = path.join(CACHE_DIR, "images");

function hashKey(key: string): string {
  return createHash("sha1").update(key).digest("hex");
}

export const GUNEY = { tournamentId: 27221, seasonId: 98003 };
export const KUZEY = { tournamentId: 34326, seasonId: 93435 };

type CacheEntry<T> = { data: T; fetchedAt: number };
const cache = new Map<string, CacheEntry<unknown>>();

async function readJsonCacheFile<T>(key: string): Promise<CacheEntry<T> | null> {
  try {
    const raw = await fs.readFile(path.join(JSON_CACHE_DIR, `${hashKey(key)}.json`), "utf8");
    const parsed = JSON.parse(raw) as { data: T; fetchedAt: number };
    return { data: parsed.data, fetchedAt: parsed.fetchedAt };
  } catch {
    return null;
  }
}

async function writeJsonCacheFile<T>(key: string, entry: CacheEntry<T>): Promise<void> {
  try {
    await fs.mkdir(JSON_CACHE_DIR, { recursive: true });
    await fs.writeFile(
      path.join(JSON_CACHE_DIR, `${hashKey(key)}.json`),
      JSON.stringify({ path: key, data: entry.data, fetchedAt: entry.fetchedAt }),
      "utf8",
    );
  } catch (err) {
    console.error("[sofascore] disk cache write failed:", key, err);
  }
}

// TTL'i beklemeden, bellekte ya da diskte olan son bilinen veriye (ne kadar
// eski olursa olsun) bakar. Bir maçın ne zaman başladığı önceden bellidir,
// bu yüzden "şu an canlı bir maç var mı" kararını TTL'i tüketmeden, mevcut
// (belki saatler önce çekilmiş) veriden verebiliriz.
async function peekJsonCache<T extends object>(apiPath: string): Promise<T | null> {
  const inMemory = cache.get(apiPath) as CacheEntry<T> | undefined;
  if (inMemory) return inMemory.data;
  const fromDisk = await readJsonCacheFile<T>(apiPath);
  if (fromDisk) {
    cache.set(apiPath, fromDisk);
    return fromDisk.data;
  }
  return null;
}

async function sofaGet<T extends object>(
  apiPath: string,
  revalidateMs: number = REVALIDATE_MS,
): Promise<T | null> {
  if (!API_KEY) return null;

  const now = Date.now();
  let cached = cache.get(apiPath) as CacheEntry<T> | undefined;
  if (!cached) {
    const fromDisk = await readJsonCacheFile<T>(apiPath);
    if (fromDisk) {
      cached = fromDisk;
      cache.set(apiPath, cached);
    }
  }

  if (cached && now - cached.fetchedAt < revalidateMs) {
    return cached.data;
  }

  try {
    const res = await fetch(`https://${API_HOST}${apiPath}`, {
      headers: {
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": API_KEY,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      throw new Error(`Sofascore API ${res.status} - ${apiPath}`);
    }

    const data = (await res.json()) as T;
    const entry: CacheEntry<T> = { data, fetchedAt: now };
    cache.set(apiPath, entry);
    await writeJsonCacheFile(apiPath, entry);
    return data;
  } catch (err) {
    console.error("[sofascore] fetch failed:", apiPath, err);
    // Eski (süresi dolmuş) veri varsa - bellekten ya da diskten - hiç veri
    // olmamasından iyidir.
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
  tournament?: { name: string };
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

// Bir maçın ne zaman başlayacağı önceden bellidir; bu yüzden "şu an canlı
// bir maç var mı" sorusunu, elimizdeki (belki eski) fikstür verisindeki
// başlama saatleriyle şu anki saati karşılaştırarak yanıtlıyoruz - taze bir
// istek atmadan. Canlı bir pencere tespit edilirse maç verisi çok daha sık
// (varsayılan 2 dakika), aksi halde normal (24 saat) sıklıkla yenilenir.
const LIVE_REVALIDATE_MS = Number(process.env.SOFASCORE_LIVE_REVALIDATE_SECONDS ?? 120) * 1000;
const MATCH_WINDOW_MS =
  Number(process.env.SOFASCORE_MATCH_WINDOW_MINUTES ?? 150) * 60 * 1000;

function hasActiveMatchWindow(events: SofaEvent[] | undefined, now: number): boolean {
  if (!events) return false;
  return events.some((e) => {
    if (e.status.type === "inprogress") return true;
    const kickoff = e.startTimestamp * 1000;
    return now >= kickoff && now <= kickoff + MATCH_WINDOW_MS;
  });
}

export async function getLastMatches(
  tournamentId: number,
  seasonId: number,
): Promise<SofaEvent[] | null> {
  const apiPath = `/tournaments/get-last-matches?tournamentId=${tournamentId}&seasonId=${seasonId}&pageIndex=0`;
  const priorData = await peekJsonCache<EventsResponse>(apiPath);
  const revalidateMs = hasActiveMatchWindow(priorData?.events, Date.now())
    ? LIVE_REVALIDATE_MS
    : REVALIDATE_MS;
  const data = await sofaGet<EventsResponse>(apiPath, revalidateMs);
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
// gereksiz yormaz. cacheKey zaten dosya adı olarak güvenli (örn. "team-123").
type ImageEntry = { bytes: ArrayBuffer; contentType: string; fetchedAt: number };
const imageCache = new Map<string, ImageEntry>();
const IMAGE_REVALIDATE_MS =
  Number(process.env.SOFASCORE_LOGO_REVALIDATE_SECONDS ?? 2592000) * 1000;

async function readImageCacheFile(cacheKey: string): Promise<ImageEntry | null> {
  try {
    const metaRaw = await fs.readFile(path.join(IMAGE_CACHE_DIR, `${cacheKey}.json`), "utf8");
    const meta = JSON.parse(metaRaw) as { contentType: string; fetchedAt: number };
    const bytes = await fs.readFile(path.join(IMAGE_CACHE_DIR, `${cacheKey}.bin`));
    return {
      bytes: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
      contentType: meta.contentType,
      fetchedAt: meta.fetchedAt,
    };
  } catch {
    return null;
  }
}

async function writeImageCacheFile(cacheKey: string, entry: ImageEntry): Promise<void> {
  try {
    await fs.mkdir(IMAGE_CACHE_DIR, { recursive: true });
    await fs.writeFile(path.join(IMAGE_CACHE_DIR, `${cacheKey}.bin`), Buffer.from(entry.bytes));
    await fs.writeFile(
      path.join(IMAGE_CACHE_DIR, `${cacheKey}.json`),
      JSON.stringify({ contentType: entry.contentType, fetchedAt: entry.fetchedAt }),
      "utf8",
    );
  } catch (err) {
    console.error("[sofascore] image disk cache write failed:", cacheKey, err);
  }
}

async function sofaGetImage(cacheKey: string, apiPath: string): Promise<ImageEntry | null> {
  if (!API_KEY) return null;

  const now = Date.now();
  let cached = imageCache.get(cacheKey);
  if (!cached) {
    const fromDisk = await readImageCacheFile(cacheKey);
    if (fromDisk) {
      cached = fromDisk;
      imageCache.set(cacheKey, cached);
    }
  }

  if (cached && now - cached.fetchedAt < IMAGE_REVALIDATE_MS) {
    return cached;
  }

  try {
    const res = await fetch(`https://${API_HOST}${apiPath}`, {
      headers: {
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": API_KEY,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      throw new Error(`Sofascore image API ${res.status} - ${apiPath}`);
    }

    const bytes = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/png";
    const entry: ImageEntry = { bytes, contentType, fetchedAt: now };
    imageCache.set(cacheKey, entry);
    await writeImageCacheFile(cacheKey, entry);
    return entry;
  } catch (err) {
    console.error("[sofascore] image fetch failed:", apiPath, err);
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
