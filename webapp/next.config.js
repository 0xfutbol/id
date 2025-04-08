/** @type {import('next').NextConfig} */

const nextConfig = {
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' http://localhost:8090 https://app.devsoccer.com https://app.metasoccer.com https://play.devsoccer.com https://play.metasoccer.com",
          },
        ],
      },
    ];
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH !== undefined ? process.env.NEXT_PUBLIC_BASE_PATH : "/id",
  images: {
    remotePatterns: [
      {
        hostname: "assets.metasoccer.com",
        protocol: "https",
      },
      {
        hostname: "assets2.metasoccer.com",
        protocol: "https",
      },
      {
        hostname: "encrypted-tbn0.gstatic.com",
        protocol: "https",
      },
      {
        hostname: "img.metasoccer.com",
        protocol: "https",
      },
      {
        hostname: "payload-marketing.moonpay.com",
        protocol: "https",
      },
      {
        hostname: "res.coinpaper.com",
        protocol: "https",
      },
      {
        hostname: "s2.coinmarketcap.com",
        protocol: "https",
      },
    ],
  },
};

module.exports = nextConfig;
