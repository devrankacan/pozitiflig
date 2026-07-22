import { getTeamLogo } from "@/lib/sofascore";

// Tarayıcı <img> etiketi RapidAPI anahtarını header'a koyamaz, bu yüzden
// logoyu kendi sunucumuz üzerinden proxy'liyoruz - anahtar hiç istemciye
// gitmez. Yanıt uzun süre (30 gün) tarayıcı/CDN tarafında da önbelleklenir.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params;
  const id = Number(teamId);

  if (!Number.isFinite(id) || id <= 0) {
    return new Response(null, { status: 400 });
  }

  const logo = await getTeamLogo(id);
  if (!logo) {
    return new Response(null, { status: 404 });
  }

  return new Response(logo.bytes, {
    headers: {
      "Content-Type": logo.contentType,
      "Cache-Control": "public, max-age=2592000, immutable",
    },
  });
}
