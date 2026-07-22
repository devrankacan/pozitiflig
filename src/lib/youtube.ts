// Pozitif Lig'in YouTube kanalındaki videoları anahtar gerektirmeyen,
// herkese açık RSS beslemesinden çeker. Kanal yeni bir video yükledikçe
// bu liste otomatik güncellenir - elle bir şey eklemek gerekmez.

import { XMLParser } from "fast-xml-parser";

const CHANNEL_ID = "UCP2niVOoFi7K7--tR0og9Pg";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
// Bu besleme anahtar/kota gerektirmediği için kısa bir önbellek süresi
// kullanmanın maliyeti yok - canlı yayınların siteye neredeyse eşzamanlı
// yansıması için varsayılan 2 dakika.
const REVALIDATE_MS = Number(process.env.YOUTUBE_REVALIDATE_SECONDS ?? 120) * 1000;

export type YoutubeVideo = {
  id: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount?: number;
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
    cache = { data: videos, fetchedAt: now };
    return videos;
  } catch (err) {
    console.error("[youtube] feed fetch failed:", err);
    if (cache) return cache.data;
    return [];
  }
}
