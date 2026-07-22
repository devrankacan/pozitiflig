// Duyurular basit bir JSON dosyasında saklanır. Dosya konumu
// ANNOUNCEMENTS_FILE ortam değişkeniyle belirlenir - üretimde (VPS) bu,
// deploy sırasında silinen "current/" klasörünün DIŞINDA, kalıcı bir
// dizini göstermelidir (bkz. DEPLOY.md). Ortam değişkeni yoksa yerel
// geliştirme için proje kökünde .data/announcements.json kullanılır.
//
// Duyuru görselleri de aynı mantıkla, JSON dosyasının yanındaki "uploads"
// klasöründe (yine current/ dışında) saklanır ve /api/duyuru-gorseli
// route'u üzerinden servis edilir. Görsel yüklenmeyen duyurular için
// public/duyuru-varsayilan.webp varsayılan görseli kullanılır.

import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const FILE_PATH = process.env.ANNOUNCEMENTS_FILE
  ? path.resolve(process.env.ANNOUNCEMENTS_FILE)
  : path.join(process.cwd(), ".data", "announcements.json");

const UPLOADS_DIR = path.join(path.dirname(FILE_PATH), "uploads");

export type Announcement = {
  id: string;
  title: string;
  body: string;
  image?: string;
  createdAt: string;
};

async function readAll(): Promise<Announcement[]> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Announcement[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(items: Announcement[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(items, null, 2), "utf8");
}

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function saveAnnouncementImage(file: File): Promise<string> {
  const ext = EXTENSION_BY_MIME[file.type] ?? "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);
  return filename;
}

async function deleteAnnouncementImageFile(filename: string | undefined): Promise<void> {
  if (!filename) return;
  try {
    await fs.unlink(path.join(UPLOADS_DIR, filename));
  } catch {
    // Dosya zaten yoksa yapılacak bir şey yok.
  }
}

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function readAnnouncementImageFile(
  filename: string,
): Promise<{ bytes: Buffer; contentType: string } | null> {
  const safeName = path.basename(filename);
  try {
    const bytes = await fs.readFile(path.join(UPLOADS_DIR, safeName));
    const contentType = CONTENT_TYPE_BY_EXTENSION[path.extname(safeName).toLowerCase()] ?? "image/jpeg";
    return { bytes, contentType };
  } catch {
    return null;
  }
}

export function announcementImageUrl(a: Pick<Announcement, "image">): string {
  return a.image ? `/api/duyuru-gorseli/${a.image}` : "/duyuru-varsayilan.webp";
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const items = await readAll();
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAnnouncement(id: string): Promise<Announcement | null> {
  const items = await readAll();
  return items.find((a) => a.id === id) ?? null;
}

export async function createAnnouncement(
  title: string,
  body: string,
  imageFile?: File | null,
): Promise<Announcement> {
  const items = await readAll();
  const announcement: Announcement = {
    id: randomUUID(),
    title: title.trim(),
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };
  if (imageFile && imageFile.size > 0) {
    announcement.image = await saveAnnouncementImage(imageFile);
  }
  items.push(announcement);
  await writeAll(items);
  return announcement;
}

export async function updateAnnouncement(
  id: string,
  title: string,
  body: string,
  options?: { imageFile?: File | null; removeImage?: boolean },
): Promise<void> {
  const items = await readAll();
  const idx = items.findIndex((a) => a.id === id);
  if (idx === -1) return;

  const current = items[idx];
  let image = current.image;

  if (options?.imageFile && options.imageFile.size > 0) {
    await deleteAnnouncementImageFile(current.image);
    image = await saveAnnouncementImage(options.imageFile);
  } else if (options?.removeImage) {
    await deleteAnnouncementImageFile(current.image);
    image = undefined;
  }

  items[idx] = { ...current, title: title.trim(), body: body.trim(), image };
  await writeAll(items);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const items = await readAll();
  const target = items.find((a) => a.id === id);
  if (target) await deleteAnnouncementImageFile(target.image);
  await writeAll(items.filter((a) => a.id !== id));
}
