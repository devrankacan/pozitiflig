import type { Metadata } from "next";
import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
import { getAnnouncements, announcementImageUrl } from "@/lib/announcements";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Duyurular | Pozitif Lig",
  description: "Pozitif Lig'den güncel duyurular.",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function DuyurularPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <SectionHeading eyebrow="Pozitif Lig" title="Duyurular" />

      {announcements.length === 0 ? (
        <div className="pl-card p-8 text-center">
          <p className="text-muted">Henüz bir duyuru yok. Yakında burada olacak.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {announcements.map((a) => (
            <article key={a.id} className="pl-card overflow-hidden">
              <div className="relative h-48 w-full bg-surface-2">
                <Image
                  src={announcementImageUrl(a)}
                  alt={a.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                  {formatDate(a.createdAt)}
                </p>
                <h2 className="mt-1 text-xl font-bold">{a.title}</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                  {a.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
