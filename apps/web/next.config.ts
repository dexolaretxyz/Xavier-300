import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  org: "xavier-300",
  project: "xavier-300-web",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  sourcemaps: {
    disable: true,
  },
  webpack: {
    reactComponentAnnotation: { enabled: true },
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: true,
  }
});
