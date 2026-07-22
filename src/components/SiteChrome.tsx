"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Admin paneli, herkese açık sitenin gezinme menüsünden ve footer'ından
// tamamen ayrı, bağımsız bir panel olmalı - bu yüzden /admin altındaki
// rotalarda global Header/Footer hiç render edilmiyor.
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  if (isAdmin) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
