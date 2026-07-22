"use client";

import { useEffect } from "react";

export default function VideoModal({
  videoId,
  title,
  onClose,
}: {
  videoId: string | null;
  title?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!videoId) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [videoId, onClose]);

  if (!videoId) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between gap-3">
          {title && <p className="truncate text-sm font-semibold text-white">{title}</p>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="ml-auto shrink-0 rounded-full bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title ?? "YouTube video"}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
