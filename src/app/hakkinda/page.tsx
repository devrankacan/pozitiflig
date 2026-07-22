import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Hakkında | Pozitif Lig",
  description: "Pozitif Lig nedir, lig formatı ve yapısı hakkında bilgi.",
};

export default function HakkindaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <SectionHeading eyebrow="Pozitif Lig" title="Hakkında" />

      <div className="flex flex-col gap-8 text-sm leading-relaxed text-foreground/90 sm:text-base">
        <p>
          Pozitif Lig, takımların <strong>Kuzey Ligi</strong> ve <strong>Güney Ligi</strong> olmak
          üzere iki ayrı organizasyonda mücadele ettiği amatör bir futbol ligidir. Güney Ligi
          kendi içinde gruplara (ör. Grup B) ayrılırken, sezon sonunda her iki ligde de
          play-off maçlarıyla şampiyonlar belirlenir. Ayrıca sezonu taçlandıran ayrı bir{" "}
          <strong>Kapanış Sezonu</strong> turnuvası da düzenlenmektedir.
        </p>

        <div>
          <h3 className="mb-2 text-lg font-bold text-teal">Lig Formatı</h3>
          <ul className="flex list-inside list-disc flex-col gap-2 text-muted">
            <li>
              <span className="text-foreground">Kuzey Ligi:</span> Round-robin usulü lig aşamasının
              ardından yarı final ve finalden oluşan play-off ile şampiyon belirlenir.
            </li>
            <li>
              <span className="text-foreground">Güney Ligi:</span> Gruplara ayrılan takımlar lig
              maçlarının ardından play-off oynar.
            </li>
            <li>
              <span className="text-foreground">Kapanış Sezonu:</span> Sezonun kapanışında
              düzenlenen ayrı bir turnuva.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-lg font-bold text-teal">İstatistikler ve Veri Ortaklığı</h3>
          <p className="text-muted">
            Puan durumu ve maç istatistikleri, resmi veri ortağı{" "}
            <a
              href="https://www.sofascore.com/tr/football/tournament/turkey-amateur/pozitiflig-guney-group-b/27221"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:underline"
            >
              Sofascore
            </a>{" "}
            üzerinden takip edilebilir. Her sezon gol krallığı ve asist krallığı sıralamaları ayrı
            ayrı yayımlanır.
          </p>
        </div>

        <div className="pl-card p-6">
          <h3 className="mb-2 text-base font-bold">Bu sayfayı geliştirelim</h3>
          <p className="text-muted">
            Pozitif Lig&apos;in kuruluş hikayesi, katılan takım sayısı, sezon takvimi gibi
            detayları paylaşırsan bu sayfayı daha eksiksiz hale getirebiliriz.
          </p>
        </div>
      </div>
    </div>
  );
}
