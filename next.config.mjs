/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  eslint: { ignoreDuringBuilds: true }, // le lint tourne via `npm run lint`
  typescript: { ignoreBuildErrors: false },
};
export default nextConfig;
