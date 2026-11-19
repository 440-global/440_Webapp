import type { Metadata } from "next";
import AccountGuard from "./AccountGuard";
import AccountShell from "@/components/account/AccountShell";

export const metadata: Metadata = {
  title: "My Account",
};

export default function AccountLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AccountGuard>
      <AccountShell>{children}</AccountShell>
    </AccountGuard>
  );
}
