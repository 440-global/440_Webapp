"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import {
  RiBankCardLine,
  RiBox3Line,
  RiCheckLine,
  RiErrorWarningLine,
  RiFlightTakeoffLine,
  RiFileCopyLine,
  RiHomeSmileLine,
  RiMapPin2Line,
  RiRefreshLine,
  RiSearchLine,
  RiShoppingBag3Line,
  RiTimeLine,
  RiTruckLine,
  RiUserLine,
  RiShieldCheckLine,
  RiShip2Line,
} from "react-icons/ri";
import { isAxiosError } from "axios";
import { useOrderTracking, usePublicOrderTracking } from "@/api/tracking";
import {
  PHASE_ORDER,
  STAGE_LABEL,
  deriveTracking,
  // type ExceptionStage,
  type TrackingPhase,
  type TrackingState,
} from "@/lib/trackingStatus";
import type {
  ExceptionStage,
  OrderTrackingResponse,
  TrackingShipment,
  TrackingTimelineEntry,
} from "@/types/types";
import { cn } from "../ui/utils";
import { useAuth } from "@/hooks/use-auth";

/* -------------------------------------------------------------------------- */
/*  Config                                                                     */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*  Config                                                                     */
/* -------------------------------------------------------------------------- */

type Tone = "default" | "warning" | "danger";

// Adjust if your sign-in route differs
const SIGN_IN_HREF = "/login";

const PHASE_META: Record<TrackingPhase, { label: string; icon: IconType }> = {
  PLACED: { label: "Order placed", icon: RiShoppingBag3Line },
  ORIGIN: { label: "At origin", icon: RiBox3Line },
  IN_TRANSIT: { label: "In transit", icon: RiTruckLine },
  ARRIVAL: { label: "Arrival & customs", icon: RiShieldCheckLine },
  OUT_FOR_DELIVERY: { label: "Out for delivery", icon: RiTruckLine },
  DELIVERED: { label: "Delivered", icon: RiHomeSmileLine },
};

const transitIcon = (mode?: string | null): IconType =>
  mode === "SEA" ? RiShip2Line : mode === "AIR" ? RiFlightTakeoffLine : RiTruckLine;

const buildSteps = (mode?: string | null) =>
  PHASE_ORDER.map((key) => ({
    key,
    label: PHASE_META[key].label,
    icon: key === "IN_TRANSIT" ? transitIcon(mode) : PHASE_META[key].icon,
  }));

// Full class strings so Tailwind can see them
const TONE = {
  default: {
    bg: "bg-(--primary)",
    ping: "bg-(--primary)/30",
    ring: "ring-(--primary)/20",
  },
  warning: {
    bg: "bg-amber-500",
    ping: "bg-amber-500/30",
    ring: "ring-amber-500/20",
  },
  danger: {
    bg: "bg-rose-500",
    ping: "bg-rose-500/30",
    ring: "ring-rose-500/20",
  },
} satisfies Record<Tone, { bg: string; ping: string; ring: string }>;

const HERO_BG = {
  default: "bg-linear-to-br from-[#1d5fb4] to-[#2a78d6]",
  warning: "bg-linear-to-br from-amber-600 to-amber-500",
  danger: "bg-linear-to-br from-rose-600 to-rose-500",
  success: "bg-linear-to-br from-emerald-600 to-emerald-500",
};

const MODE_LABEL: Record<string, string> = {
  SEA: "Sea freight",
  AIR: "Air freight",
};

const MODE_DETAILS: {
  key: string;
  label: string;
  fmt?: (v: string | number) => string;
}[] = [
  { key: "vesselName", label: "Vessel" },
  { key: "voyage", label: "Voyage" },
  { key: "billOfLading", label: "Bill of lading" },
  { key: "cbm", label: "Volume", fmt: (v) => `${v} CBM` },
];

const EXCEPTION_META: Record<
  ExceptionStage,
  { title: string; sub: string; tone: Exclude<Tone, "default"> }
> = {
  DELAYED: {
    title: "Shipment delayed",
    sub: "Your shipment is running behind schedule. We'll keep this page updated.",
    tone: "warning",
  },
  ON_HOLD: {
    title: "Shipment on hold",
    sub: "Your shipment is temporarily on hold. Contact support if this continues.",
    tone: "warning",
  },
  CUSTOMS_HOLD: {
    title: "Held at customs",
    sub: "Customs is reviewing your shipment. This can add some time.",
    tone: "warning",
  },
  DAMAGED: {
    title: "Shipment damaged",
    sub: "Your shipment was reported damaged. Please contact support.",
    tone: "danger",
  },
  LOST: {
    title: "Shipment lost",
    sub: "We couldn't locate your shipment. Please contact support.",
    tone: "danger",
  },
};

const CANCELLED_COPY = {
  title: "Order cancelled",
  sub: "This order was cancelled. Contact support if this is unexpected.",
};

function getHeroCopy(
  order: OrderTrackingResponse,
  { status, progressStage, exception }: TrackingState,
  awaitingPayment: boolean,
) {
  if (status === "CANCELLED") return CANCELLED_COPY;
  if (exception) return EXCEPTION_META[exception];

  if (awaitingPayment) {
    return {
      title: order.payment.label || "Awaiting payment",
      sub: "We'll start preparing your order as soon as payment is confirmed.",
    };
  }

  if (status === "PLACED") {
    return isPaid(order.payment.status)
      ? {
          title: "Order confirmed",
          sub: "Payment received. We're arranging your shipment and will update this page as soon as it's booked.",
        }
      : {
          title: "Order received",
          sub: "We've got your order and will confirm it shortly.",
        };
  }

  const title =
    order.shipment?.stageLabel ||
    (progressStage ? STAGE_LABEL[progressStage] : PHASE_META[status].label);

  const mode = order.shipment?.mode;
  const way = mode === "SEA" ? " by sea" : mode === "AIR" ? " by air" : "";

  const subs: Record<Exclude<TrackingPhase, "PLACED">, string> = {
    ORIGIN: "Your order is being prepared for shipment at origin.",
    IN_TRANSIT: `Your order is on its way${way}.`,
    ARRIVAL:
      "Your shipment has reached its destination and is being processed for release.",
    OUT_FOR_DELIVERY: "Your order is nearly there. Keep your phone close.",
    DELIVERED: "Your order has arrived. Enjoy!",
  };

  return { title, sub: subs[status] };
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const fmtDate = (iso?: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-NG", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(iso))
    : "—";

const fmtDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));

const isPaid = (status: string) =>
  ["PAID", "SUCCESS", "SUCCESSFUL"].includes(status.toUpperCase());

const paymentChip = (status: string) => {
  const s = status.toUpperCase();
  if (["PAID", "SUCCESS", "SUCCESSFUL"].includes(s))
    return "bg-emerald-500/10 text-emerald-600";
  if (isPaid(s)) return "bg-emerald-500/10 text-emerald-600";
  if (["FAILED", "REFUNDED", "CANCELLED"].includes(s))
    return "bg-rose-500/10 text-rose-600";
  return "bg-black/5 text-(--text-muted) dark:bg-white/10";
};

const card =
  "rounded-2xl border border-(--border-default) bg-(--bg-surface)";

/* -------------------------------------------------------------------------- */
/*  Root                                                                       */
/* -------------------------------------------------------------------------- */

export default function OrderTracking({ token }: { token: string | null }) {
  const { authenticated: isAuthenticated, loading: authLoading } = useAuth();

  const authed = useOrderTracking(token ?? undefined, {
    enabled: !authLoading && isAuthenticated,
  });

  const sessionExpired =
    isAxiosError(authed.error) && authed.error.response?.status === 401;

  const pub = usePublicOrderTracking(token ?? undefined, {
    enabled: !authLoading && (!isAuthenticated || sessionExpired),
  });

  const viewerAuthed = isAuthenticated && !sessionExpired;

  const { data, isPending, isError, error, refetch, isFetching } = viewerAuthed
    ? authed
    : pub;

  if (!token) {
    return <TrackingError notFound onRetry={() => {}} retrying={false} />;
  }

  if (authLoading || isPending) return <TrackingSkeleton />;

  if (isError || !data) {
    const notFound = isAxiosError(error) && error.response?.status === 404;
    return (
      <TrackingError
        notFound={notFound}
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  }


  return (
    <TrackingView
      order={data}
      viewerAuthed={viewerAuthed}
      onRefresh={() => refetch()}
      refreshing={isFetching}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Main view                                                                  */
/* -------------------------------------------------------------------------- */

function TrackingView({
  order,
  viewerAuthed,
  onRefresh,
  refreshing,
}: {
  order: OrderTrackingResponse;
  viewerAuthed: boolean;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const state = deriveTracking(order);
  const { status, progressStage, exception } = state;
  const cancelled = status === "CANCELLED";
  const delivered = status === "DELIVERED";
  // Unpaid and nothing has progressed past "placed"
  const awaitingPayment = isPaid(order.payment.status) && status === "PLACED";

  const copy = getHeroCopy(order, state, awaitingPayment);

  const tone: Tone = cancelled
    ? "danger"
    : exception
      ? EXCEPTION_META[exception].tone
      : awaitingPayment
        ? "warning"
        : "default";

  const heroBg = delivered ? HERO_BG.success : HERO_BG[tone];
  const steps = buildSteps(order.shipment?.mode);

  // Sub-label under the active step
  const stageDetail = exception
    ? EXCEPTION_META[exception].title
    : order.shipment?.stageLabel ||
      (progressStage ? STAGE_LABEL[progressStage] : undefined);

  const events = [...(order.timeline ?? [])].sort(
    (a, b) => +new Date(b.at) - +new Date(a.at),
  );

  const deliveredAt = events.find((e) => e.stage === "DELIVERED")?.at;
  const pill = delivered
    ? { label: "Delivered on", date: deliveredAt ?? order.lastUpdatedAt }
    : order.shipment?.estimatedDelivery
      ? { label: "Estimated delivery", date: order.shipment.estimatedDelivery }
      : { label: "Placed on", date: order.placedAt };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Hero */}
      <section
        className={cn(
          "relative overflow-hidden rounded-3xl p-6 text-white sm:p-8 mt-12",
          heroBg,
        )}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-white/70">
              Order {order.reference}
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl">{copy.title}</h1>
            <p className="max-w-md text-sm text-white/80">{copy.sub}</p>
            {exception && progressStage && (
              <p className="text-xs text-white/70">
                Last known stage: {STAGE_LABEL[progressStage]}
              </p>
            )}
            <p className="inline-flex items-center gap-1.5 pt-1 text-xs text-white/70">
              <RiUserLine /> For {order.customer.displayName}
            </p>
          </div>

          {!cancelled && (
            <div className="rounded-2xl bg-white/15 px-5 py-3 backdrop-blur">
              <p className="text-[11px] uppercase tracking-wider text-white/70">
                {pill.label}
              </p>
              <p className="mt-0.5 flex items-center gap-2 text-lg font-semibold">
                <RiTimeLine className="shrink-0" />
                {fmtDate(pill.date)}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Progress */}
      {status !== "CANCELLED" && (
        <section className={cn(card, "p-5 sm:p-8")}>
          <ProgressStepper
            steps={steps}
            current={PHASE_ORDER.indexOf(status)}
            tone={tone}
            detail={stageDetail}
          />
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {/* Timeline */}
        <section className={cn(card, "p-5 sm:p-6")}>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Tracking history</h2>
              <p className="mt-0.5 text-xs text-(--text-muted)">
                Last updated {fmtDateTime(order.lastUpdatedAt)}
              </p>
            </div>
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-(--text-muted) transition hover:bg-black/5 disabled:opacity-60 dark:hover:bg-white/10"
            >
              <RiRefreshLine className={cn(refreshing && "animate-spin")} />
              Refresh
            </button>
          </div>
          <Timeline events={events} />
        </section>

        {/* Side details */}
        <aside className="space-y-6">
          {/* Payment */}
          <div className={cn(card, "p-5 sm:p-6")}>
            <h2 className="mb-4 text-base font-semibold">Payment</h2>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--primary)/10 text-(--primary)">
                <RiBankCardLine />
              </span>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  paymentChip(order.payment.status),
                )}
              >
                {order.payment.label || order.payment.status}
              </span>
            </div>
          </div>

          {/* Shipment: authenticated viewers, once a shipment exists */}
          {order.shipment && <ShipmentCard shipment={order.shipment} />}

          {/* Unauthenticated: shipment is hidden by the API, not necessarily absent */}
          {!viewerAuthed && !cancelled && (
            <div className={cn(card, "p-5 sm:p-6")}>
              <h2 className="mb-2 text-base font-semibold">Shipment details</h2>
              <p className="text-sm text-(--text-muted)">
                Sign in to see carrier, route and container details once your
                order ships.
              </p>
              <a
                href={SIGN_IN_HREF}
                className="mt-4 inline-flex items-center rounded-full bg-(--primary) px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Sign in
              </a>
            </div>
          )}

          {/* Items */}
          <div className={cn(card, "p-5 sm:p-6")}>
            <h2 className="mb-4 text-base font-semibold">
              Items{" "}
              <span className="font-normal text-(--text-muted)">
                ({order.items.length})
              </span>
            </h2>
            <ul className="space-y-3">
              {order.items.map((item, i) => (
                <li
                  key={`${item.name}-${i}`}
                  className="flex items-center gap-3"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-black/5 dark:bg-white/10">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-(--text-muted)">
                        <RiBox3Line />
                      </div>
                    )}
                  </div>
                  <p className="min-w-0 flex-1 line-clamp-2 wrap-break-word text-sm font-medium capitalize">
                    {item.name.toLowerCase()}
                  </p>
                  <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium dark:bg-white/10">
                    ×{item.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Shareable link (authenticated responses only) */}
          {order.trackingUrl && (
            <div className={cn(card, "p-5 sm:p-6")}>
              <h2 className="mb-4 text-base font-semibold">Tracking link</h2>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-mono text-(--text-muted)">
                  {order.trackingUrl}
                </span>
                <CopyButton
                  value={order.trackingUrl}
                  label="Copy tracking link"
                />
              </div>
            </div>
          )}
        </aside>
      </div>
    </motion.div>
  );
}

function ShipmentCard({ shipment }: { shipment: TrackingShipment }) {
  const route = [shipment.originPort, shipment.destinationPort]
    .filter(Boolean)
    .join(" → ");

  return (
    <div className={cn(card, "p-5 sm:p-6")}>
      <h2 className="mb-4 text-base font-semibold">Shipment</h2>
      <dl className="space-y-3 text-sm">
        {shipment.mode && (
          <Row
            label="Mode"
            value={MODE_LABEL[shipment.mode] ?? shipment.mode}
          />
        )}
        {shipment.carrier && <Row label="Carrier" value={shipment.carrier} />}
        {route && <Row label="Route" value={route} />}
        {shipment.estimatedDelivery && (
          <Row
            label="Estimated Delivery"
            value={fmtDate(shipment.estimatedDelivery)}
          />
        )}
        {shipment.trackingNumber && (
          <CopyRow label="Tracking no." value={shipment.trackingNumber} />
        )}
        {shipment.containerNumber && (
          <CopyRow label="Container no." value={shipment.containerNumber} />
        )}
        {MODE_DETAILS.map(({ key, label, fmt }) => {
          const v = shipment.modeDetails?.[key];
          if (v == null || v === "") return null;
          return (
            <Row key={key} label={label} value={fmt ? fmt(v) : String(v)} />
          );
        })}
      </dl>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Progress stepper                                                           */
/* -------------------------------------------------------------------------- */

function ProgressStepper({
  steps,
  current,
  tone,
  detail,
}: {
  steps: { key: string; label: string; icon: IconType }[];
  current: number;
  tone: Tone;
  detail?: string;
}) {
  const pct = (current / (steps.length - 1)) * 100;
  const finished = current === steps.length - 1;
  const t = TONE[tone];
  const showDetail = (label: string) =>
    detail && detail.toLowerCase() !== label.toLowerCase() ? detail : null;

  return (
    <>
      {/* Desktop / tablet: horizontal */}
      <div className="relative hidden sm:block">
        {/* Track spans first-to-last node centres (nodes are w-24 => 3rem inset) */}
        <div className="absolute left-12 right-12 top-4.5 h-1 rounded-full bg-black/10 dark:bg-white/10">
          <motion.div
            className={cn("h-full rounded-full", t.bg)}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <ol className="relative flex justify-between">
          {steps.map((step, i) => {
            const done = i < current || (i === current && finished);
            const active = i === current;
            const Icon = step.icon;
            const sub = active ? showDetail(step.label) : null;
            return (
              <li
                key={step.key}
                className="flex w-24 flex-col items-center gap-2 text-center"
              >
                <span
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-full text-lg transition",
                    done || active
                      ? cn(t.bg, "text-white")
                      : "bg-(--bg-surface) text-(--text-muted) ring-2 ring-black/10 dark:ring-white/10",
                  )}
                >
                  {active && !finished && (
                    <span
                      className={cn(
                        "absolute inset-0 animate-ping rounded-full",
                        t.ping,
                      )}
                    />
                  )}
                  <span className="relative">
                    {done ? <RiCheckLine /> : <Icon />}
                  </span>
                </span>
                <span
                  className={cn(
                    "text-xs leading-tight",
                    active ? "font-semibold" : "text-(--text-muted)",
                  )}
                >
                  {step.label}
                </span>
                {sub && (
                  <span className="-mt-1 text-[11px] leading-tight text-(--text-muted)">
                    {sub}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Mobile: vertical */}
      <ol className="space-y-0 sm:hidden">
        {steps.map((step, i) => {
          const done = i < current || (i === current && finished);
          const active = i === current;
          const Icon = step.icon;
          const sub = active ? showDetail(step.label) : null;
          return (
            <li key={step.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-base transition",
                    done || active
                      ? cn(t.bg, "text-white")
                      : "bg-black/5 text-(--text-muted) dark:bg-white/10",
                    active && cn("ring-4", t.ring),
                  )}
                >
                  {done ? <RiCheckLine /> : <Icon />}
                </span>
                {i < steps.length - 1 && (
                  <span
                    className={cn(
                      "my-1 min-h-6 w-0.5 flex-1 rounded-full",
                      i < current ? t.bg : "bg-black/10 dark:bg-white/10",
                    )}
                  />
                )}
              </div>
              <div className="pt-2">
                <p
                  className={cn(
                    "text-sm",
                    active ? "font-semibold" : "text-(--text-muted)",
                  )}
                >
                  {step.label}
                </p>
                {sub && (
                  <p className="mt-0.5 text-xs text-(--text-muted)">{sub}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Timeline                                                                   */
/* -------------------------------------------------------------------------- */

function Timeline({ events }: { events: TrackingTimelineEntry[] }) {
  if (events.length === 0) {
    return (
      <p className="rounded-xl bg-black/5 p-4 text-sm text-(--text-muted) dark:bg-white/5">
        No updates yet. Check back soon.
      </p>
    );
  }

  return (
    <ol className="relative">
      {events.map((event, i) => {
        const latest = i === 0;
        const last = i === events.length - 1;
        return (
          <motion.li
            key={`${event.at}-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.06, 0.5) }}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {!last && (
              <span className="absolute left-2.75 top-6 h-[calc(100%-1.5rem)] w-px bg-black/10 dark:bg-white/10" />
            )}
            <span
              className={cn(
                "relative mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                latest
                  ? "bg-(--primary) ring-4 ring-(--primary)/15"
                  : "bg-black/10 dark:bg-white/15",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  latest ? "bg-white" : "bg-(--text-muted)/60",
                )}
              />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p
                  className={cn(
                    "text-sm",
                    latest ? "font-semibold" : "font-medium",
                  )}
                >
                  {event.title}
                </p>
                <time className="text-xs text-(--text-muted)">
                  {fmtDateTime(event.at)}
                </time>
              </div>
              {event.description && (
                <p className="mt-1 text-sm text-(--text-muted)">
                  {event.description}
                </p>
              )}
              {event.location && (
                <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-(--text-muted)">
                  <RiMapPin2Line /> {event.location}
                </p>
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                               */
/* -------------------------------------------------------------------------- */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-(--text-muted)">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-(--text-muted)">{label}</dt>
      <dd className="flex items-center gap-2 font-medium">
        <span className="font-mono">{value}</span>
        <CopyButton value={value} label={`Copy ${label.toLowerCase()}`} />
      </dd>
    </div>
  );
}

function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable, ignore */
    }
  };

  return (
    <button
      onClick={copy}
      aria-label={label}
      className="rounded-md p-1 text-(--text-muted) transition hover:bg-black/5 hover:text-(--primary) dark:hover:bg-white/10"
    >
      {copied ? (
        <RiCheckLine className="text-emerald-500" />
      ) : (
        <RiFileCopyLine />
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Loading + error states                                                     */
/* -------------------------------------------------------------------------- */

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-(--primary-soft)/50",
        className,
      )}
    />
  );
}

function TrackingSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading order">
      <Pulse className="h-40 rounded-3xl" />
      <Pulse className="h-32" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Pulse className="h-80" />
        <div className="space-y-6">
          <Pulse className="h-38" />
          <Pulse className="h-38" />
        </div>
      </div>
    </div>
  );
}

function TrackingError({
  notFound,
  onRetry,
  retrying,
}: {
  notFound: boolean;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div className={cn(card, "mx-auto max-w-lg p-8 text-center")}>
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-2xl text-rose-500">
        {notFound ? <RiSearchLine /> : <RiErrorWarningLine />}
      </span>
      <h1 className="text-lg font-semibold">
        {notFound ? "We couldn't find that order" : "Something went wrong"}
      </h1>
      <p className="mt-2 text-sm text-(--text-muted)">
        {notFound
          ? "This tracking link may be invalid or has expired. Check the link in your email or SMS and try again."
          : "We had trouble loading your tracking details. Please try again."}
      </p>
      {!notFound && (
        <button
          onClick={onRetry}
          disabled={retrying}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-(--primary) px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          <RiRefreshLine className={cn(retrying && "animate-spin")} />
          Try again
        </button>
      )}
    </div>
  );
}
