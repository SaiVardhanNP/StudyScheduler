/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ✅ Skip ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ✅ Skip type checking during build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
