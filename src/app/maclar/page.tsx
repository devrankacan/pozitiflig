import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import VideoGrid from "@/components/VideoGrid";
import { getChannelVideos } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Maçlar | Pozitif Lig",
  description: "Pozitif Lig maç yayınları - YouTube üzerinden izle.",
};

export default async function MaclarPage() {
  const videos = await getChannelVideos();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <SectionHeading
        eyebrow="POZİTİF LİG YouTube"
        title="Maçlar"
        description="Bir maça tıkla, doğrudan burada izle. Kanalda yeni bir yayın çıktıkça bu liste otomatik güncellenir."
      />
      {videos.length === 0 ? (
        <div className="pl-card p-8 text-center">
          <p className="text-muted">Şu anda maç yayınları alınamıyor. Lütfen daha sonra tekrar dene.</p>
        </div>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}
