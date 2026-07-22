import { getPlayerImage } from "@/lib/sofascore";

// Tarayıcı <img> etiketi RapidAPI anahtarını header'a koyamaz, bu yüzden
// görseli kendi sunucumuz üzerinden proxy'liyoruz - anahtar hiç istemciye
// gitmez. Yanıt uzun süre (30 gün) tarayıcı/CDN tarafında da önbelleklenir.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ playerId: string }> },
) {
  const { playerId } = await params;
  const id = Number(playerId);

  if (!Number.isFinite(id) || id <= 0) {
    return new Response(null, { status: 400 });
  }

  const image = await getPlayerImage(id);
  if (!image) {
    return new Response(null, { status: 404 });
  }

  return new Response(image.bytes, {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=2592000, immutable",
    },
  });
}
