import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Turbopack config with resolve aliases
  turbopack: {
    resolveAlias: {
      // Stub out Node.js modules that aren't available in browser
      fs: { browser: './lib/stubs/fs.js' },
      path: { browser: 'path-browserify' },
    },
  },
  // Mark blaze SDK as external for server components
  serverExternalPackages: ['@blaze-cardano/sdk'],
  webpack: (config, { isServer }) => {
    // Polyfills for @blaze-cardano/sdk (used in production builds)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
