/** @type {import("next").NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.uzmart.org",
        port: "",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "foodyman.s3.amazonaws.com",
        port: "",
        pathname: "/public/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol: "https",
        hostname: "api.demand24.org",
      },
      {
        protocol: "https",
        hostname: "serviceappnew.asyscraft.com", 
        port: "",
        pathname: "/storage/**", 
      },
      {
        protocol: "http",
        hostname: "serviceappnew.asyscraft.com", 
        port: "",
        pathname: "/storage/**", 
      },
      {
        protocol: "http",
        hostname: "serviceapp.asyscraft.com", 
        port: "",
        pathname: "/storage/**", 
      },
    ],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
