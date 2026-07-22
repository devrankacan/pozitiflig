export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <span className="text-lg font-extrabold tracking-tight">
              Pozitif<span className="pl-gradient-text">Lig</span>
            </span>
            <p className="mt-2 max-w-sm text-sm text-muted">
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
                className="text-teal hover:underline"
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
