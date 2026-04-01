import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // pptxgenjs conditionally imports node:fs and node:https at runtime
      // (only in Node.js), but webpack can't resolve "node:" protocol.
      // Use a plugin to replace these imports with empty modules.
      config.plugins.push(
        new (require('webpack')).NormalModuleReplacementPlugin(
          /^node:(fs|https)$/,
          (resource: { request: string }) => {
            resource.request = require.resolve('./lib/empty-module.js');
          }
        )
      );
    }
    return config;
  },
};

export default nextConfig;
