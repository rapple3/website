/** @type {import('next').NextConfig} */
const nextConfig = {
  // The site is a single page now; old page addresses go home
  async redirects() {
    return ['/about', '/work', '/blog', '/projects', '/notes'].map((source) => ({
      source,
      destination: '/',
      permanent: false,
    }));
  },
}

module.exports = nextConfig
