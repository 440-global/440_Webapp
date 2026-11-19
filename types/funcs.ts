import { toast } from "react-toastify";
import { SingleBale } from "./baletype";
import axios from "axios";

export const formatNumber = (value: number): string => {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  }

  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }

  if (value >= 1_000) {
    return (value / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  }

  return value.toString();
};

export const openPaystackPopup = async (
  accessCode: string,
  onSuccess: (transaction: { reference: string }) => void,
  onCancel: () => void,
) => {
  // @ts-ignore
  const PaystackPop = (await import("@paystack/inline-js")).default;

  const paystack = new PaystackPop();

  paystack.resumeTransaction(accessCode, {
    onSuccess: (transaction: any) => {
      onSuccess({ reference: transaction.reference });
    },
    onCancel: () => {
      onCancel();
    },
    onError: (error: any) => {
      console.error("Paystack error:", error?.message);
    },
  });
};

export const showToast = (
  type: "success" | "error" | "warning" | "info",
  message: string,
) => {
  if (type === "success") toast.success(message);
  else if (type === "error") toast.error(message);
  else if (type === "info") toast.info(message);
  else toast.warning(message);
};

export const isObjectComplete = (
  obj: Record<string, unknown>,
  excludeKeys: string[] = [],
): boolean => {
  return Object.entries(obj).every(([key, value]) => {
    if (excludeKeys.includes(key)) return true;

    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") return value.trim() !== "";
    return value !== null && value !== undefined;
  });
};

// helper (outside the component, or in a utils file)
export const getTierRate = (
  tiers: SingleBale["discountLadder"]["tiers"] | undefined,
  slots: number,
) => {
  if (!tiers?.length || slots <= 0) return 0;

  // exact match first, otherwise fall back to the highest tier the user has reached
  const exact = tiers.find((t) => t.slots === slots);
  if (exact) return exact.ratePercent;

  const reached = tiers
    .filter((t) => t.slots <= slots)
    .sort((a, b) => b.slots - a.slots)[0];

  return reached?.ratePercent ?? 0;
};

export const fmtDateTime = (iso: string | undefined) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export function getErrorStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) return error.response?.status;
  return undefined;
}