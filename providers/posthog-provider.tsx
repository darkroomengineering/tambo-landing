'use client'

// PostHog is initialized via dynamic import() in instrumentation-client.ts
// No components use usePostHog() hooks, so the PostHogProvider context wrapper
// is not needed. This avoids pulling posthog-js (~29MB) into the initial client bundle.

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
