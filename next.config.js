/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /pdf\.worker\.entry\.js$/,
      use: { loader: "file-loader" },
    });

    return config;
  },
};

module.exports = nextConfig;
