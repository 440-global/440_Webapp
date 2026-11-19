import type { Metadata } from "next";
import TrackingEntry from "@/components/tracking/TrackingEntry";

export const metadata: Metadata = {
  title: "Track your order",
  robots: { index: false, follow: false }, // tracking links are private
};

/**
 * Static export: only `out/track/_fallback/index.html` is built.
 *
 * Tracking tokens are created after deploy, so they can't be listed here.
 * public/.htaccess rewrites /track/<any-token> to that fallback page, which
 * is fully client-rendered: TrackingEntry reads the token from the URL and
 * fetches live data.
 *
 * This file must stay a server component (no "use client"), because
 * generateStaticParams can't be exported from a client component.
 */
export function generateStaticParams() {
  return [{ tokenId: "_fallback" }];
}

export default function TrackOrderPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-6xl">
        <TrackingEntry />
      </div>
    </main>
  );
}
