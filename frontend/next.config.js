/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false, // default is already false, but be explicit
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Fully disable source maps for client bundles in production
      config.devtool = false;
    }
    return config;
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
};

module.exports = nextConfig;
