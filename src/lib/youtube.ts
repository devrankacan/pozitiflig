// Pozitif Lig'in YouTube kanalındaki videoları anahtar gerektirmeyen,
// herkese açık RSS beslemesinden çeker. Kanal yeni bir video yükledikçe
// bu liste otomatik güncellenir - elle bir şey eklemek gerekmez.
//
// Hangi videonun şu an CANLI yayında olduğunu RSS beslemesi söylemiyor;
// bunun için (varsa) YouTube Data API v3 anahtarıyla ek, çok ucuz bir
// sorgu (videos.list, 1 kota birimi) yapılır. Anahtar tanımlı değilse bu
// adım atlanır ve site sorunsuz çalışmaya devam eder, sadece "canlı"
// rozeti gösterilmez.

import { XMLParser } from "fast-xml-parser";

const CHANNEL_ID = "UCP2niVOoFi7K7--tR0og9Pg";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
// Bu besleme anahtar/kota gerektirmediği için kısa bir önbellek süresi
// kullanmanın maliyeti yok - canlı yayınların siteye neredeyse eşzamanlı
// yansıması için varsayılan 2 dakika.
const REVALIDATE_MS = Number(process.env.YOUTUBE_REVALIDATE_SECONDS ?? 120) * 1000;

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export type YoutubeVideo = {
  id: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount?: number;
  isLive?: boolean;
};

type FeedEntry = {
  "yt:videoId": string;
  title: string;
  published: string;
  "media:group"?: {
    "media:thumbnail"?: { "@_url"?: string };
    "media:community"?: { "media:statistics"?: { "@_views"?: string } };
  };
};

type FeedDoc = {
  feed?: {
    entry?: FeedEntry | FeedEntry[];
  };
};

let cache: { data: YoutubeVideo[]; fetchedAt: number } | null = null;

function parseFeed(xml: string): YoutubeVideo[] {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const doc = parser.parse(xml) as FeedDoc;
  const rawEntries = doc.feed?.entry;
  const entries = Array.isArray(rawEntries) ? rawEntries : rawEntries ? [rawEntries] : [];

  return entries.map((e) => {
    const id = e["yt:videoId"];
    const thumbnailUrl =
      e["media:group"]?.["media:thumbnail"]?.["@_url"] ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    const views = e["media:group"]?.["media:community"]?.["media:statistics"]?.["@_views"];
    return {
      id,
      title: String(e.title),
      publishedAt: e.published,
      thumbnailUrl,
      viewCount: views ? Number(views) : undefined,
    };
  });
}

type LiveStatusResponse = {
  items?: { id: string; snippet?: { liveBroadcastContent?: string } }[];
};

// videos.list tek çağrıda (id'ler virgülle ayrılmış, en fazla 50 tane) 1
// kota birimi harcar - günlük 10.000 birim ücretsiz kotada bu sıklıkta
// (varsayılan 2 dakikada bir, ~720 çağrı/gün) kullanmak sorun olmaz.
async function fetchLiveStatus(videoIds: string[]): Promise<Map<string, boolean>> {
  const liveById = new Map<string, boolean>();
  if (!YOUTUBE_API_KEY || videoIds.length === 0) return liveById;

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoIds.join(",")}&key=${YOUTUBE_API_KEY}`,
      { cache: "no-store", signal: AbortSignal.timeout(8000) },
    );

    if (!res.ok) {
      throw new Error(`YouTube Data API ${res.status}`);
    }

    const data = (await res.json()) as LiveStatusResponse;
    for (const item of data.items ?? []) {
      liveById.set(item.id, item.snippet?.liveBroadcastContent === "live");
    }
  } catch (err) {
    console.error("[youtube] live status fetch failed:", err);
  }

  return liveById;
}

export async function getChannelVideos(): Promise<YoutubeVideo[]> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < REVALIDATE_MS) {
    return cache.data;
  }

  try {
    const res = await fetch(FEED_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      throw new Error(`YouTube feed ${res.status}`);
    }

    const xml = await res.text();
    const videos = parseFeed(xml);

    const liveById = await fetchLiveStatus(videos.map((v) => v.id));
    if (liveById.size > 0) {
      for (const v of videos) {
        v.isLive = liveById.get(v.id) ?? false;
      }
    }

    cache = { data: videos, fetchedAt: now };
    return videos;
  } catch (err) {
    console.error("[youtube] feed fetch failed:", err);
    if (cache) return cache.data;
    return [];
  }
}
