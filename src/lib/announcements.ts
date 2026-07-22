// Duyurular basit bir JSON dosyasında saklanır. Dosya konumu
// ANNOUNCEMENTS_FILE ortam değişkeniyle belirlenir - üretimde (VPS) bu,
// deploy sırasında silinen "current/" klasörünün DIŞINDA, kalıcı bir
// dizini göstermelidir (bkz. DEPLOY.md). Ortam değişkeni yoksa yerel
// geliştirme için proje kökünde .data/announcements.json kullanılır.

import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const FILE_PATH = process.env.ANNOUNCEMENTS_FILE
  ? path.resolve(process.env.ANNOUNCEMENTS_FILE)
  : path.join(process.cwd(), ".data", "announcements.json");

export type Announcement = {
  id: string;
  title: string;
  body: string;
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

export async function getAnnouncements(): Promise<Announcement[]> {
  const items = await readAll();
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAnnouncement(id: string): Promise<Announcement | null> {
  const items = await readAll();
  return items.find((a) => a.id === id) ?? null;
}

export async function createAnnouncement(title: string, body: string): Promise<Announcement> {
  const items = await readAll();
  const announcement: Announcement = {
    id: randomUUID(),
    title: title.trim(),
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };
  items.push(announcement);
  await writeAll(items);
  return announcement;
}

export async function updateAnnouncement(id: string, title: string, body: string): Promise<void> {
  const items = await readAll();
  const idx = items.findIndex((a) => a.id === id);
  if (idx === -1) return;
  items[idx] = { ...items[idx], title: title.trim(), body: body.trim() };
  await writeAll(items);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const items = await readAll();
  await writeAll(items.filter((a) => a.id !== id));
}
