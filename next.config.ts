import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
   images: {
    remotePatterns: [new URL('https://minio-server.jssolucoeseservicos.com.br/**')],
  },
};

export default nextConfig;
