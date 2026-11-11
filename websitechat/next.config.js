/** @type {import('next').NextConfig} */
const nextConfig = {
  // Old page addresses keep working
  async redirects() {
    return [
      { source: '/work', destination: '/projects', permanent: false },
      { source: '/blog', destination: '/notes', permanent: false },
    ];
  },
}

module.exports = nextConfig
