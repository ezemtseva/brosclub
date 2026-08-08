/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "crests.football-data.org",
      },
      {
        // Club badges for fixtures synced from the FPL API
        protocol: "https",
        hostname: "resources.premierleague.com",
      },
    ],
  },
}

export default nextConfig