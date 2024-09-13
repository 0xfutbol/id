/** @type {import('next').NextConfig} */
const nextConfig = {
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
        hostname: "img.metasoccer.com",
        protocol: "https",
      },
      {
        hostname: "res.coinpaper.com",
        protocol: "https",
      },
      {
        hostname: "s2.coinmarketcap.com",
        protocol: "https",
      }
    ],
  },
};

module.exports = nextConfig
