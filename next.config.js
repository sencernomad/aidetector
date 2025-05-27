/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Ensure any direct access to static files is redirected to the home page
      {
        source: '/esmer-ai.webp',
        destination: '/',
        permanent: false,
      },
      // Add similar redirects for other static files if needed
    ];
  }
};

module.exports = nextConfig; 