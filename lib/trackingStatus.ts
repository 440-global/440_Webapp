import type { ExceptionStage, OrderTrackingResponse, ShipmentStage } from "@/types/types";

/** Stages that say something is wrong but not where the goods are. */

/** Stages that move the shipment forward. */
export type ProgressStage = Exclude<
  ShipmentStage,
  ExceptionStage | "CANCELLED"
>;

/** Coarse phases shown on the progress bar. */
export type TrackingPhase =
  | "PLACED"
  | "ORIGIN"
  | "IN_TRANSIT"
  | "ARRIVAL"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

export type TrackingStatus = TrackingPhase | "CANCELLED";

export const PHASE_ORDER: TrackingPhase[] = [
  "PLACED",
  "ORIGIN",
  "IN_TRANSIT",
  "ARRIVAL",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const STAGE_PHASE: Record<ProgressStage, TrackingPhase> = {
  BOOKED: "ORIGIN",
  AT_ORIGIN_WAREHOUSE: "ORIGIN",
  LOADED: "ORIGIN",
  DEPARTED_ORIGIN_PORT: "IN_TRANSIT",
  DEPARTED_ORIGIN_AIRPORT: "IN_TRANSIT",
  IN_TRANSIT: "IN_TRANSIT",
  ARRIVED_DEST_PORT: "ARRIVAL",
  ARRIVED_DEST_AIRPORT: "ARRIVAL",
  CUSTOMS: "ARRIVAL",
  CLEARED: "ARRIVAL",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
};

export const STAGE_LABEL: Record<ShipmentStage, string> = {
  BOOKED: "Booked",
  AT_ORIGIN_WAREHOUSE: "At origin warehouse",
  LOADED: "Loaded",
  DEPARTED_ORIGIN_PORT: "Departed origin port",
  DEPARTED_ORIGIN_AIRPORT: "Departed origin airport",
  IN_TRANSIT: "In transit",
  ARRIVED_DEST_PORT: "Arrived at destination port",
  ARRIVED_DEST_AIRPORT: "Arrived at destination airport",
  CUSTOMS: "In customs",
  CLEARED: "Cleared customs",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  DELAYED: "Delayed",
  ON_HOLD: "On hold",
  CUSTOMS_HOLD: "Held at customs",
  DAMAGED: "Damaged",
  LOST: "Lost",
  CANCELLED: "Cancelled",
};

const EXCEPTION_STAGES: readonly string[] = [
  "DELAYED",
  "ON_HOLD",
  "CUSTOMS_HOLD",
  "DAMAGED",
  "LOST",
];

const isProgressStage = (s: string | null | undefined): s is ProgressStage =>
  !!s && Object.hasOwn(STAGE_PHASE, s);

const isExceptionStage = (s: string | null): s is ExceptionStage =>
  s !== null && EXCEPTION_STAGES.includes(s);

export interface TrackingState {
  /** Where the progress bar sits, or CANCELLED. */
  status: TrackingStatus;
  /** Latest forward-moving stage, if a shipment exists. */
  progressStage: ProgressStage | null;
  /** Set when the shipment is delayed, held, damaged or lost. */
  exception: ExceptionStage | null;
}

/**
 * Works for all three response shapes:
 *  - unauthenticated: shipment null, timeline stages null  -> PLACED
 *  - authenticated, no shipment                            -> PLACED
 *  - authenticated, shipment present                       -> from shipment.stage,
 *    falling back to the newest timeline entry that has a stage
 */
export function deriveTracking(
  order: Pick<OrderTrackingResponse, "timeline" | "shipment" | "orderStatus">,
): TrackingState {
  const newestFirst = [...(order.timeline ?? [])].sort(
    (a, b) => +new Date(b.at) - +new Date(a.at),
  );

  const stages: (string | null | undefined)[] = [
    order.shipment?.stage,
    ...newestFirst.map((e) => e.stage),
  ];

  const current = stages.find((s): s is string => !!s) ?? null;
  const progressStage = stages.find(isProgressStage) ?? null;

  if (current === "CANCELLED" || order.orderStatus === "CANCELLED") {
    return { status: "CANCELLED", progressStage, exception: null };
  }

  let status: TrackingPhase = progressStage
    ? STAGE_PHASE[progressStage]
    : order.shipment
      ? "ORIGIN" // shipment exists but no stage yet: it has at least been booked
      : "PLACED";

  if (current === "CUSTOMS_HOLD") status = "ARRIVAL";
  if (order.orderStatus === "DELIVERED") status = "DELIVERED";

  const exception: ExceptionStage | null =
    status === "DELIVERED"
      ? null
      : isExceptionStage(current)
        ? current
        : order.shipment?.delayed
          ? "DELAYED"
          : null;

  return { status, progressStage, exception };
}

export const isTerminal = (s: TrackingStatus) =>
  s === "DELIVERED" || s === "CANCELLED";