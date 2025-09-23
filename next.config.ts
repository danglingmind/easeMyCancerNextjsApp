import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongodb'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        child_process: false,
        dns: false,
        timers: false,
        "timers/promises": false,
        "fs/promises": false,
        buffer: false,
        util: false,
        events: false,
        querystring: false,
        punycode: false,
        process: false,
        global: false,
      };
    }
    return config;
  },
};

export default nextConfig;
