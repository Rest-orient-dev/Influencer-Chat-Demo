import os from "node:os";
import type { NextConfig } from "next";

function lanDevOrigins() {
  const origins = new Set<string>(["localhost", "127.0.0.1"]);
  for (const list of Object.values(os.networkInterfaces())) {
    for (const net of list ?? []) {
      const v4 = String(net.family).includes("4");
      if (v4 && !net.internal) origins.add(net.address);
    }
  }
  return [...origins];
}

const nextConfig: NextConfig = {
  // Next.js 16 bloquea POST/API si entras por IP de LAN (otra PC) y no está en esta lista.
  allowedDevOrigins: lanDevOrigins(),
};

export default nextConfig;
