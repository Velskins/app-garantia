/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["myejlpapoeyoacjvyfjm.supabase.co"], // ✅ Ajoute ici ton domaine Supabase
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /pdf\.worker\.entry\.js$/,
      use: { loader: "file-loader" },
    });

    return config;
  },
};

module.exports = nextConfig;
