import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { getAnnouncements, announcementImageUrl } from "@/lib/announcements";
import { createAction, updateAction, deleteAction, logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin | Pozitif Lig",
  robots: { index: false, follow: false },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminPage() {
  await requireAdmin();
  const announcements = await getAnnouncements();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Yönetim
          </span>
          <h1 className="text-2xl font-bold">Duyurular</h1>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Çıkış Yap
          </button>
        </form>
      </div>

      <div className="pl-card mb-10 p-6">
        <h2 className="mb-4 text-lg font-bold">Yeni Duyuru</h2>
        <form action={createAction} encType="multipart/form-data" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-title" className="text-sm font-medium">
              Başlık
            </label>
            <input
              id="new-title"
              name="title"
              type="text"
              required
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-body" className="text-sm font-medium">
              İçerik
            </label>
            <textarea
              id="new-body"
              name="body"
              rows={4}
              required
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-image" className="text-sm font-medium">
              Görsel (opsiyonel)
            </label>
            <input
              id="new-image"
              name="image"
              type="file"
              accept="image/*"
              className="text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-foreground file:transition-colors hover:file:bg-border"
            />
            <p className="text-xs text-muted">
              Görsel seçilmezse varsayılan duyuru görseli kullanılır.
            </p>
          </div>
          <button
            type="submit"
            className="self-start rounded-full bg-gradient-to-r from-accent to-accent-dark px-5 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Yayınla
          </button>
        </form>
      </div>

      <h2 className="mb-4 text-lg font-bold">Yayınlanan Duyurular ({announcements.length})</h2>
      <div className="flex flex-col gap-4">
        {announcements.length === 0 && (
          <p className="text-sm text-muted">Henüz duyuru eklenmedi.</p>
        )}
        {announcements.map((a) => (
          <div key={a.id} className="pl-card p-5">
            <form action={updateAction} encType="multipart/form-data" className="flex flex-col gap-3">
              <input type="hidden" name="id" value={a.id} />
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={announcementImageUrl(a)}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
                <div className="flex flex-1 flex-col gap-1.5">
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    className="text-xs text-muted file:mr-2 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-foreground file:transition-colors hover:file:bg-border"
                  />
                  {a.image && (
                    <label className="flex items-center gap-1.5 text-xs text-muted">
                      <input type="checkbox" name="removeImage" className="accent-accent" />
                      Görseli kaldır (varsayılana dön)
                    </label>
                  )}
                </div>
              </div>
              <input
                name="title"
                defaultValue={a.title}
                required
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-semibold outline-none focus:border-accent"
              />
              <textarea
                name="body"
                defaultValue={a.body}
                rows={3}
                required
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">{formatDate(a.createdAt)}</span>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold transition-colors hover:bg-surface-2"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </form>
            <form action={deleteAction} className="mt-2 flex justify-end">
              <input type="hidden" name="id" value={a.id} />
              <button
                type="submit"
                className="text-xs font-semibold text-red-500 hover:underline"
              >
                Sil
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
