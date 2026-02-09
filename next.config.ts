import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

// Only wrap with Sentry in production or if DSN is set
const sentryEnabled = process.env.NODE_ENV === "production" || !!process.env.SENTRY_DSN;

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      // Suppress logs during build
      silent: true,
      
      // For source maps upload
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    })
  : nextConfig;
