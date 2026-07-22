import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.ytimg.com" }],
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
