// Pozitif Lig'in YouTube kanalındaki videolarını YouTube Data API v3 ile
// çeker. Daha önce anahtar gerektirmeyen genel RSS beslemesi (feeds/
// videos.xml) kullanılıyordu, ama bu uç nokta YouTube tarafında bu kanal
// için (ve muhtemelen genel olarak) 404 vermeye başladı - kanal ID'si
// canonical link ile doğrulanmasına rağmen hem VPS'ten hem tarayıcıdan
// tutarlı şekilde başarısız oldu. Bu yüzden resmi API'ye geçildi.
//
// Video listesi için channels.list çağrısına gerek yok: her kanalın
// "yüklemeler" oynatma listesi ID'si, kanal ID'sindeki "UC" önekinin
// "UU" ile değiştirilmesiyle elde edilir (YouTube'un belgelenmiş,
// güvenilir kuralı) - bu da bir kota birimi tasarrufu sağlar.
// Aynı sorguda hem "şu an canlı mı" hem de izlenme sayısı bilgisi
// videos.list (part=snippet,statistics) ile tek seferde alınır.
//
// Anahtar tanımlı değilse fonksiyonlar boş liste döner; site çökmez,
// sadece Maçlar sayfası "şu anda alınamıyor" mesajı gösterir.

const CHANNEL_ID = "UCP2niVOoFi7K7--tR0og9Pg";
const UPLOADS_PLAYLIST_ID = `UU${CHANNEL_ID.slice(2)}`;
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

type PlaylistItemsResponse = {
  items?: {
    snippet?: {
      title?: string;
      publishedAt?: string;
      resourceId?: { videoId?: string };
      thumbnails?: {
        maxres?: { url?: string };
        high?: { url?: string };
        default?: { url?: string };
      };
    };
  }[];
};

async function fetchUploadedVideos(): Promise<YoutubeVideo[]> {
  if (!YOUTUBE_API_KEY) return [];

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=15&playlistId=${UPLOADS_PLAYLIST_ID}&key=${YOUTUBE_API_KEY}`,
    { cache: "no-store", signal: AbortSignal.timeout(8000) },
  );

  if (!res.ok) {
    throw new Error(`YouTube playlistItems API ${res.status}`);
  }

  const data = (await res.json()) as PlaylistItemsResponse;
  return (data.items ?? [])
    .map((item) => {
      const id = item.snippet?.resourceId?.videoId;
      if (!id) return null;
      const thumbnailUrl =
        item.snippet?.thumbnails?.maxres?.url ??
        item.snippet?.thumbnails?.high?.url ??
        item.snippet?.thumbnails?.default?.url ??
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      return {
        id,
        title: item.snippet?.title ?? "",
        publishedAt: item.snippet?.publishedAt ?? new Date().toISOString(),
        thumbnailUrl,
      } satisfies YoutubeVideo;
    })
    .filter((v): v is YoutubeVideo => v !== null);
}

type VideoDetailsResponse = {
  items?: {
    id: string;
    snippet?: { liveBroadcastContent?: string };
    statistics?: { viewCount?: string };
  }[];
};

type VideoDetails = { isLive: boolean; viewCount?: number };

// videos.list tek çağrıda (id'ler virgülle ayrılmış, en fazla 50 tane) 1
// kota birimi harcar - günlük 10.000 birim ücretsiz kotada bu sıklıkta
// (varsayılan 2 dakikada bir, ~720 çağrı/gün) kullanmak sorun olmaz.
async function fetchVideoDetails(videoIds: string[]): Promise<Map<string, VideoDetails>> {
  const detailsById = new Map<string, VideoDetails>();
  if (!YOUTUBE_API_KEY || videoIds.length === 0) return detailsById;

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(",")}&key=${YOUTUBE_API_KEY}`,
      { cache: "no-store", signal: AbortSignal.timeout(8000) },
    );

    if (!res.ok) {
      throw new Error(`YouTube videos API ${res.status}`);
    }

    const data = (await res.json()) as VideoDetailsResponse;
    for (const item of data.items ?? []) {
      detailsById.set(item.id, {
        isLive: item.snippet?.liveBroadcastContent === "live",
        viewCount: item.statistics?.viewCount ? Number(item.statistics.viewCount) : undefined,
      });
    }
  } catch (err) {
    console.error("[youtube] video details fetch failed:", err);
  }

  return detailsById;
}

let cache: { data: YoutubeVideo[]; fetchedAt: number } | null = null;

export async function getChannelVideos(): Promise<YoutubeVideo[]> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < REVALIDATE_MS) {
    return cache.data;
  }

  try {
    const videos = await fetchUploadedVideos();
    const detailsById = await fetchVideoDetails(videos.map((v) => v.id));
    for (const v of videos) {
      const details = detailsById.get(v.id);
      if (details) {
        v.isLive = details.isLive;
        v.viewCount = details.viewCount;
      }
    }

    cache = { data: videos, fetchedAt: now };
    return videos;
  } catch (err) {
    console.error("[youtube] channel videos fetch failed:", err);
    if (cache) return cache.data;
    return [];
  }
}
