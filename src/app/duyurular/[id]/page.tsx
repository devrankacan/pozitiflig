import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAnnouncement, announcementImageUrl } from "@/lib/announcements";

export const dynamic = "force-dynamic";

type PageParams = { params: Promise<{ id: string }> };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { id } = await params;
  const announcement = await getAnnouncement(id);
  return {
    title: announcement ? `${announcement.title} | Pozitif Lig` : "Duyuru | Pozitif Lig",
    description: announcement?.body.slice(0, 160) ?? "Pozitif Lig'den bir duyuru.",
  };
}

export default async function DuyuruDetailPage({ params }: PageParams) {
  const { id } = await params;
  const announcement = await getAnnouncement(id);
  if (!announcement) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Link
        href="/duyurular"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent"
      >
        ← Duyurular
      </Link>

      <article className="pl-card overflow-hidden">
        <div className="relative h-64 w-full bg-surface-2 sm:h-80">
          <Image
            src={announcementImageUrl(announcement)}
            alt={announcement.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            {formatDate(announcement.createdAt)}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">{announcement.title}</h1>
          <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-foreground/90">
            {announcement.body}
          </p>
        </div>
      </article>
    </div>
  );
}
