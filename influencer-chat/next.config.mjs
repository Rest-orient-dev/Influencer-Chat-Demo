import os from "node:os";

function lanDevOrigins() {
  const origins = new Set(["localhost", "127.0.0.1"]);
  try {
    for (const list of Object.values(os.networkInterfaces())) {
      for (const net of list ?? []) {
        if (String(net.family).includes("4") && !net.internal) {
          origins.add(net.address);
        }
      }
    }
  } catch {
    // Hostinger / restricted build environments
  }
  return [...origins];
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: lanDevOrigins(),
};

export default nextConfig;
