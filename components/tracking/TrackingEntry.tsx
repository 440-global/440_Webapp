"use client";

import { useEffect, useState } from "react";
import OrderTracking from "./OrderTracking";

// undefined = not read yet (first render), null = no token in the URL
export default function TrackingEntry() {
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    // Expected path: /track/<token>. Read it from the real browser URL,
    // because the route param is just the "_fallback" placeholder on a static export.
    const segments = window.location.pathname.split("/").filter(Boolean);
    const i = segments.indexOf("track");
    const raw = i >= 0 ? segments[i + 1] : undefined;
    setToken(raw && raw !== "_fallback" ? decodeURIComponent(raw) : null);
  }, []);

  if (token === undefined) return null;

  return <OrderTracking token={token} />;
}
