import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "217.76.59.171",    // Contabo VPS public IP
    "*.vmi3267370.*",  // VPS hostname pattern
    "*",               // Allow all origins in dev (safe for private VPS)
  ],
};

export default nextConfig;
