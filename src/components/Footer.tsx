import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Image src="/logo.png" alt="Pozitif Lig" width={1682} height={584} className="h-9 w-auto" />
            <p className="mt-3 max-w-sm text-sm text-muted">
              Kuzey ve Güney Ligi başta olmak üzere Pozitif Lig&apos;in tüm maç sonuçları, puan
              durumları ve istatistikleri.
            </p>
          </div>
          <div className="text-sm text-muted">
            <p>
              Puan durumu verileri{" "}
              <a
                href="https://www.sofascore.com/tr/football/tournament/turkey-amateur/pozitiflig-guney-group-b/27221"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Sofascore
              </a>{" "}
              tarafından sağlanmaktadır.
            </p>
          </div>
        </div>
        <p className="mt-8 text-xs text-muted">
          © {new Date().getFullYear()} Pozitif Lig. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
