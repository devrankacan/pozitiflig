import Link from "next/link";
import Image from "next/image";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b border-border px-4 py-3 sm:px-6">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/logo.png"
            alt="Pozitif Lig"
            width={1682}
            height={584}
            className="site-logo h-8 w-auto"
          />
        </Link>
      </div>
      {children}
    </div>
  );
}
