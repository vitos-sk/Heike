/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Bilder aus dem Blog liegen im Supabase-Speicher.
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};

module.exports = nextConfig;
