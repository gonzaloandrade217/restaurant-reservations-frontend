import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;