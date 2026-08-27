import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async redirects() {
    return [
      { source: "/sewa/:path*", destination: "/:path*", permanent: true },
      { source: "/login", destination: "/login/admin", permanent: true },
    ];
  },
};

export default nextConfig;
