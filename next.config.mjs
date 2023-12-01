/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // TODO: react-pdf issue
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
