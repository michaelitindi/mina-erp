import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Capture 10% of transactions in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Only enable in production unless explicitly set
  enabled: process.env.NODE_ENV === "production" || !!process.env.SENTRY_DSN,
  
  environment: process.env.NODE_ENV,
})
