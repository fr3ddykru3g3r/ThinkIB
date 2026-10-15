/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'public/vault/**/*',
        '../ThinkIB 2/**/*',
      ],
    },
  },
  async rewrites() {
    return [
      {
        source: '/vault/:subject(physics-topicals|chemistry-topicals|math-topicals)/:file*',
        destination: '/api/past-papers/topicals/:subject/:file*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/vault/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // question images are content-addressed by question id and rebuilt only by the extractor
        source: '/sat/q/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400' }],
      },
      {
        source: '/thinkib/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
