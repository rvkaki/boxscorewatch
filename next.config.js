/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.nba.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dims.apnews.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default config;
