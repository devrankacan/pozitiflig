"use client";

import { useState } from "react";
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

export default function VideoGrid({ videos }: { videos: YoutubeVideo[] }) {
  const [selected, setSelected] = useState<YoutubeVideo | null>(null);

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setSelected(v)}
            className="pl-card group flex flex-col overflow-hidden text-left transition-colors hover:border-accent"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-surface-2">
              <Image
                src={v.thumbnailUrl}
                alt={v.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-accent opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-1 p-4">
              <p className="line-clamp-2 font-semibold">{v.title}</p>
              <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted">
                <span>{formatDate(v.publishedAt)}</span>
                {formatViews(v.viewCount) && <span>{formatViews(v.viewCount)}</span>}
              </div>
            </div>
          </button>
        ))}
      </div>

      <VideoModal
        videoId={selected?.id ?? null}
        title={selected?.title}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
