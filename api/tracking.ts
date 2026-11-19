import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import http from "@/lib/http";
import { deriveTracking, isTerminal } from "@/lib/trackingStatus";
import type { OrderTrackingResponse, TrackingApiEnvelope } from "@/types/types";

function useTrackingQuery(
  scope: "private" | "public",
  token: string | undefined,
  options?: { enabled?: boolean },
) {
  const path =
    scope === "private"
      ? `/buyer/orders/${token}/tracking`
      : `/public/track/${token}`;

  return useQuery<OrderTrackingResponse>({
    queryKey: ["order-tracking", scope, token],
    queryFn: async () => {
      const { data: body } = await http.get<TrackingApiEnvelope>(path);
      if (!body?.success || !body.data) {
        throw new Error(body?.message ?? "Unable to fetch tracking");
      }
      return body.data;
    },
    enabled: !!token && (options?.enabled ?? true),
    retry: (count, err) => {
      const status = isAxiosError(err) ? err.response?.status : undefined;
      if (status === 404) return false;
      if (scope === "private" && status === 401) return false;
      return count < 2;
    },
    refetchInterval: (query) =>
      query.state.data && isTerminal(deriveTracking(query.state.data).status)
        ? false
        : 60_000,
    refetchOnWindowFocus: true,
  });
}

export const useOrderTracking = (token?: string, o?: { enabled?: boolean }) =>
  useTrackingQuery("private", token, o);

export const usePublicOrderTracking = (
  token?: string,
  o?: { enabled?: boolean },
) => useTrackingQuery("public", token, o);
