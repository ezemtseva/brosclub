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
      {
        // Country flags in the FIFA all-time table
        protocol: "https",
        hostname: "flagcdn.com",
      },
    ],
  },
}

export default nextConfig