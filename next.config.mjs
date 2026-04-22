/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.ltwebstatic.com'
      }
    ]
  }
};

export default nextConfig;
