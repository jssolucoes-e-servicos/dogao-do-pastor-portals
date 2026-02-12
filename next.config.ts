import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/comprar',
        permanent: false,
      },
    ]
  },
  reactCompiler: true,
   images: {
    remotePatterns: [new URL('https://minio-server.jssolucoeseservicos.com.br/**')],
  },
};

export default nextConfig;
