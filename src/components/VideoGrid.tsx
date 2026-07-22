"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { YoutubeVideo } from "@/lib/youtube";
import VideoModal from "@/components/VideoModal";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatViews(count?: number): string | null {
  if (!count) return null;
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(".0", "")} bin izlenme`;
  return `${count} izlenme`;
}

function LiveBadge({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-red-600 font-bold uppercase tracking-wider text-white ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
      </span>
      Canlı
    </span>
  );
}

function VideoCard({
  video,
  featured = false,
  onSelect,
}: {
  video: YoutubeVideo;
  featured?: boolean;
  onSelect: (v: YoutubeVideo) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(video)}
      className={`pl-card group flex flex-col overflow-hidden text-left transition-colors hover:border-accent ${
        featured ? "border-red-500/60" : ""
      }`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-surface-2">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          sizes={featured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
          className="object-cover transition-transform group-hover:scale-105"
        />
        {video.isLive && (
          <span className="absolute left-3 top-3">
            <LiveBadge />
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-accent opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className={`line-clamp-2 font-semibold ${featured ? "text-lg" : ""}`}>{video.title}</p>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted">
          <span>{formatDate(video.publishedAt)}</span>
          {formatViews(video.viewCount) && <span>{formatViews(video.viewCount)}</span>}
        </div>
      </div>
    </button>
  );
}

export default function VideoGrid({ videos }: { videos: YoutubeVideo[] }) {
  const [selected, setSelected] = useState<YoutubeVideo | null>(null);
  const [query, setQuery] = useState("");

  const liveVideos = useMemo(() => videos.filter((v) => v.isLive), [videos]);
  const liveIds = useMemo(() => new Set(liveVideos.map((v) => v.id)), [liveVideos]);
  const rest = useMemo(() => videos.filter((v) => !liveIds.has(v.id)), [videos, liveIds]);

  const filteredRest = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return rest;
    return rest.filter((v) => v.title.toLocaleLowerCase("tr-TR").includes(q));
  }, [rest, query]);

  return (
    <div>
      {liveVideos.length > 0 && (
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <LiveBadge />
            <h3 className="text-lg font-bold">Şu An Canlı Yayında</h3>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {liveVideos.map((v) => (
              <VideoCard key={v.id} video={v} featured onSelect={setSelected} />
            ))}
          </div>
        </div>
      )}

      <div className="relative mb-6 max-w-sm">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Maç veya takım ara..."
          className="w-full rounded-full border border-border bg-surface-2 py-2 pl-9 pr-4 text-sm outline-none focus:border-accent"
        />
      </div>

      {filteredRest.length === 0 ? (
        <div className="pl-card p-8 text-center">
          <p className="text-muted">
            {query ? "Aramanla eşleşen bir maç bulunamadı." : "Başka maç bulunamadı."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRest.map((v) => (
            <VideoCard key={v.id} video={v} onSelect={setSelected} />
          ))}
        </div>
      )}

      <VideoModal
        videoId={selected?.id ?? null}
        title={selected?.title}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
