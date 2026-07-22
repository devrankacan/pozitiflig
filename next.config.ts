import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.ytimg.com" }],
  },
  // Duyuru görseli yüklemesi admin panelinde bir Server Action üzerinden
  // yapılıyor; varsayılan 1MB sınırı fotoğraflar için yetersiz kalır.
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/mac-sonuclari",
        destination: "/puan-durumu",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
