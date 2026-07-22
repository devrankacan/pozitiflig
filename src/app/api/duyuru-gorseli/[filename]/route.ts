import { readAnnouncementImageFile } from "@/lib/announcements";

// Yüklenen duyuru görselleri, deploy'da silinen current/ klasörünün
// dışındaki kalıcı bir dizinde tutulur - bu yüzden public/ üzerinden değil
// bu route üzerinden servis edilir.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const image = await readAnnouncementImageFile(filename);
  if (!image) {
    return new Response(null, { status: 404 });
  }

  return new Response(new Uint8Array(image.bytes), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
