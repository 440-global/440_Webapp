"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCrossSubdomainCookie } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
};

type AuthStatus = "checking" | "authed" | "guest";

export default function AccountGuard({ children }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    const merchant = localStorage.getItem("merchant");
    const token = getCrossSubdomainCookie("440_token");

    if (merchant && token) {
      setStatus("authed");
    } else {
      setStatus("guest");
      router.replace("/login");
    }
  }, [router]);

  // Server render and first client render both output null, so there's no
  // hydration mismatch, and protected content never flashes for guests.
  if (status !== "authed") return null;

  return <>{children}</>;
}