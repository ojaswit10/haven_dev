import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" makes `next build` produce .next/standalone: a minimal
  // server.js plus ONLY the node_modules files the app actually imports
  // (found by tracing). The Docker runtime image copies just that folder,
  // so it doesn't need the full node_modules — much smaller image.
  output: "standalone",
};

export default nextConfig;
