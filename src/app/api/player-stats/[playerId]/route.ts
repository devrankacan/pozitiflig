import { getPlayerStatistics } from "@/lib/sofascore";

// İstatistikleri istemcinin (oyuncu popup'ının) isteğiyle anlık olarak
// getirir - bu sayede kadrodaki 30+ oyuncunun tamamı için önceden istek
// atılmaz, sadece kullanıcının gerçekten tıkladığı oyuncu için kota harcanır.

export async function GET(
  request: Request,
  { params }: { params: Promise<{ playerId: string }> },
) {
  const { playerId } = await params;
  const id = Number(playerId);

  if (!Number.isFinite(id) || id <= 0) {
    return Response.json(null, { status: 400 });
  }

  const seasons = await getPlayerStatistics(id);
  if (!seasons || seasons.length === 0) {
    return Response.json(null, { status: 404 });
  }

  const teamFilter = new URL(request.url).searchParams.get("team");
  const normalizedFilter = teamFilter?.toLocaleLowerCase("tr-TR");
  const match = normalizedFilter
    ? seasons.find((s) => s.team?.name?.toLocaleLowerCase("tr-TR") === normalizedFilter)
    : undefined;
  const chosen = match ?? seasons[0];

  return Response.json(
    {
      team: chosen.team?.name ?? null,
      year: chosen.year,
      stats: chosen.statistics,
    },
    { headers: { "Cache-Control": "private, max-age=300" } },
  );
}
