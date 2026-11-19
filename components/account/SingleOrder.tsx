"use client";

import {
  useAddDeliveryMethod,
  useConfirmPayment,
  useGetDeliveries,
  useGetSingleOrder,
  useInitiatePayment,
  usePayOrderShippingCharges,
} from "@/api/order";
import { useGetWalletBalance } from "@/api/wallet";
import { Badge, Button, Card, Input } from "../ui";
import { getOrderStatusVariant } from "./orderStatusBadge";
import {
  RiBankCard2Line,
  RiBox1Line,
  RiEBike2Line,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiHandCoinLine,
  RiLoader4Fill,
  RiWalletLine,
} from "react-icons/ri";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "../ui/table/TableWrapper";
import { buildDirectInstallmentEntryBody, buildOrderPaymentEntryBody } from "@/lib/initiate-payment-helpers";
import { toast } from "react-toastify";
import { fmtDateTime, openPaystackPopup } from "@/types/funcs";
import { AxiosError } from "axios";
import React, { useMemo, useState } from "react";
import { DeliveryMethodPayload, OrderDetails, PaymentAction, PayShippingPayload } from "@/types/checkout";
import { useNestedForm } from "../../hooks/use-nested-form";
import { DeliveryPayload } from "../../types/types";
import ActionDropdown from "../ui/action_dropdown";
import { useGetUserProfile } from "../../api/auth";
import WalletPinModal from "../shared/WalletPinModal";

type Props = {
  orderId: number;
};

type OrderItem = OrderDetails["items"][number];

type GroupedProduct = {
  product: OrderItem["product"];
  unitPrice: number;
  totalQuantity: number;
  totalPrice: number;
  colors: Record<
    string,
    {
      color: OrderItem["color"] | null;
      sizes: { size: OrderItem["size"] | null; quantity: number }[];
    }
  >;
};

/* ---------- helpers (hoisted: no need to recreate on every render) ---------- */

const formatTimeAgo = (date: string) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

const formatFullDate = (date: string) =>
  new Date(date).toLocaleString("en-NG", {
    dateStyle: "long",
    timeStyle: "short",
  });

const formatShortDate = (date: string) =>
  new Date(date).toLocaleDateString("en-NG", { dateStyle: "medium" });

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(value);

const toastOpts = {
  position: "top-right" as const,
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

const groupOrderItems = (items: OrderItem[]): GroupedProduct[] => {
  const grouped = new Map<number, GroupedProduct>();

  for (const item of items) {
    let group = grouped.get(item.product.id);

    if (!group) {
      group = {
        product: item.product,
        unitPrice: item.unitPrice,
        totalQuantity: 0,
        totalPrice: 0,
        colors: {},
      };
      grouped.set(item.product.id, group);
    }

    group.totalQuantity += item.quantity;
    group.totalPrice += item.totalPrice;

    // No variant info, so don't create an empty "Qty × 5" group
    if (!item.color && !item.size) continue;

    const colorKey = String(item.color?.id ?? "no-color");
    group.colors[colorKey] ??= { color: item.color ?? null, sizes: [] };
    group.colors[colorKey].sizes.push({
      size: item.size ?? null,
      quantity: item.quantity,
    });
  }

  return Array.from(grouped.values());
};

type FlowType = "DIRECT" | "BALE";
type PaymentOption = {
  value: PaymentAction;
  label: string;
  description: string;
};

const PAYMENT_OPTIONS: Record<FlowType, PaymentOption[]> = {
  DIRECT: [
    {
      value: "UPFRONT",
      label: "Upfront payment",
      description: "Pay the upfront portion of this order now.",
    },
    {
      value: "REMAINDER",
      label: "Remainder payment",
      description: "Pay off the outstanding balance.",
    },
    {
      value: "INSTALLMENT_ENTRY",
      label: "Installment plan",
      description: "Start paying this order in installments.",
    },
  ],
  BALE: [
    {
      value: "LOCK",
      label: "Lock payment",
      description: "Lock your spot in the bale.",
    },
    {
      value: "HALF",
      label: "Half payment",
      description: "Pay half now and settle the rest later.",
    },
    {
      value: "FULL",
      label: "Full payment",
      description: "Pay the full amount in one go.",
    },
    {
      value: "REMAINDER",
      label: "Remainder payment",
      description: "Pay off the outstanding balance.",
    },
    {
      value: "INSTALLMENT_ENTRY",
      label: "Installment plan",
      description: "Start paying in installments.",
    },
  ],
};

const defaultDeliveryValues: DeliveryMethodPayload = {
  method: 'PICKUP',
  deliveryAddressId: 0
};

const defaultShippingValues: PayShippingPayload = {
  paymentType: "WALLET",
  pin: ""
}

const radioOptions = [
  {
    label: "Pickup",
    value: "PICKUP",
    node: <RiBox1Line size={32} />,
  },
  {
    label: "Doorstep",
    value: "DOORSTEP",
    node: <RiEBike2Line size={32} />,
  },
];

const shippingOptions = [
  {
    label: "Wallet",
    value: "WALLET",
    node: <RiWalletLine size={32} />,
  },
  {
    label: "Card",
    value: "CARD",
    node: <RiBankCard2Line size={32} />,
  },
  // {
  //   label: "Other",
  //   value: "OTHER",
  //   node: <RiHandCoinLine size={32} />,
  // }
];

const shipOptions = [
  {
    label: "Wallet",
    value: "WALLET",
    description: "Pay with your 440 wallet"
  },
  {
    label: "Card",
    value: "CARD",
    description: "Pay with your bank card"
  }
]

const formatNgn = (n: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(n);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

/* ------------------------------- component -------------------------------- */

const SingleOrder = ({ orderId }: Props) => {
  const { data: order, isLoading } = useGetSingleOrder(orderId);
  const { mutateAsync: payInstallment, isPending: isPaymentPending } =
    useInitiatePayment();
  const confirmPayment = useConfirmPayment();

  const { mutateAsync: addDeliveryMethod, isPending: deliveryPending } = 
    useAddDeliveryMethod(orderId);
  
  const { data: user, isPending: isUserPending, error } = useGetUserProfile();
  const { data: walletData, isPending: isWalletPending } = useGetWalletBalance(user?.id);

  const { mutateAsync: payCharges, isPending: chargePending } = usePayOrderShippingCharges(orderId);

  const { data: deliveries = [] } = useGetDeliveries();

  const [action, setAction] = useState<PaymentAction | null>(null);
  const [chargeId, setChargeId] = useState<number | null>(null);
  const [shippingStep, setshippingStep] = useState(1);

  const flowType: FlowType = order?.order.baleId != null ? "BALE" : "DIRECT";
  const paymentOptions = PAYMENT_OPTIONS[flowType];

  const [modalType, setModalType] = useState<'confirm' | 'delivery-method' | 'pay-shipping' | null>(null);

  const { formValues: deliveryValues, setFormValues: setDeliveryValues, handleChange } =
    useNestedForm<DeliveryMethodPayload>(defaultDeliveryValues)
    ;
  const { formValues: shippingValues, setFormValues: setShippingValues, handleChange: shippingChange } =
    useNestedForm<PayShippingPayload>(defaultShippingValues);

  const initiateInstallmentPayment = async () => {
    const oid = order?.order.id;
    if (oid == null) {
      toast.error("Order is still loading or missing.");
      return;
    }

    const data = {
      body: buildDirectInstallmentEntryBody(oid),
      idempotencyKey: crypto.randomUUID(),
    };

    try {
      const res = await payInstallment(data);

      if (res.status == 200 || res.status == 201) {
        const accessCode = res?.data?.data?.accessCode;
        if (!accessCode) {
          toast.error("Payment could not be started: missing access code.");
          return;
        }

        await openPaystackPopup(
          accessCode,
          async ({ reference }) => {
            await confirmPayment.mutateAsync(reference);
            toast.success("Payment successful");
          },
          () => toast.error("Payment cancelled"),
        );
      } else {
        toast.error("Failed to make payment", toastOpts);
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(
        err.response?.data?.message ??
          err.message ??
          "Something went wrong, please try again",
        toastOpts,
      );
    }
  };

  const initiatePayment = async (selected: PaymentAction) => {
   const oid = order?.order.id;
   const cid = order?.order.checkoutId;
   if (oid == null) {
     toast.error("Order is still loading or missing.");
     return;
   }

   const data = {
     body: buildOrderPaymentEntryBody(
       oid,
       flowType,
       selected,
     ),
     idempotencyKey: crypto.randomUUID(),
   };

    try {
      const res = await payInstallment(data);

      if (res.status == 200 || res.status == 201) {
        const accessCode = res?.data?.data?.accessCode;
        if (!accessCode) {
          toast.error("Payment could not be started: missing access code.");
          return;
        }

        await openPaystackPopup(
          accessCode,
          async ({ reference }) => {
            await confirmPayment.mutateAsync(reference);
            toast.success("Payment successful");
          },
          () => toast.error("Payment cancelled"),
        );
      } else {
        toast.error("Failed to make payment", toastOpts);
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(
        err.response?.data?.message ??
          err.message ??
          "Something went wrong, please try again",
        toastOpts,
      );
    }
  };

 const closeConfirmModal = () => {
   setModalType(null);
   setAction(null);
 };

 const handleConfirmPayment = async () => {
   if (!action) return;
   const selected = action;
   closeConfirmModal();
   await initiatePayment(selected);
 };

  const copyTrackingToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      toast.success("Tracking token copied");
    } catch {
      toast.error("Couldn't copy the token. Copy it manually instead.");
    }
  };

  if (isLoading) {
    return (
      <div className="h-100 flex justify-center items-center">
        <RiLoader4Fill size={40} className="text-(--primary) animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const groupedProducts = groupOrderItems(order.items);
  
  const { totalAmount, amountPaid } = order.order;
  const paidPct =
    totalAmount > 0
      ? Math.min(100, Math.round((amountPaid / totalAmount) * 100))
      : 0;
  const { trackingUrl, trackingToken, deliveryMethod } = order.order;
  // Prefer the server-provided URL; fall back to the in-app tracking route
  const trackingHref =
    trackingUrl ?? (trackingToken ? `/track/${trackingToken}` : null);
  const itemCount = groupedProducts.reduce(
    (n: number, p: any) => n + p.totalQuantity,
    0,
  );

  const deliveryOptions = deliveries.map((del: DeliveryPayload) => {
    return {
      label: del.address,
      value: del.id
    }
  });

  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { deliveryAddressId, ...rest } = deliveryValues;

      const payload = {
        ...rest,
        ...(deliveryValues.method === "DOORSTEP" && { deliveryAddressId }),
      };

      const res = await addDeliveryMethod(payload);
      if (res.status == 200 || res.status == 201) {
        if (deliveryMethod == null) {
          toast.success("Delivery method added");
        } else {
          toast.success("Delivery method changed");
        }
        setDeliveryValues(defaultDeliveryValues);
      } else {
        toast.warning("Something went wrong");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(
        err.response?.data?.message || err.message || "Something went wrong",
      );
    }
  }

  // Shipping charges
  const charges = order.shipping.charges ?? [];

  const selectedCharge = charges.find((c) => c.id === chargeId) ?? null;

  const closeShippingFlow = () => {
    setModalType(null);
    setChargeId(null);
    setshippingStep(1);
    setShippingValues(defaultShippingValues);
  };

  const payShippingCharge = async (payload: PayShippingPayload) => {
    if (chargeId == null) {
      toast.error("No shipping charge selected.");
      return;
    }

    try {
      // Same mutation for both paths; only the payload differs
      const res = await payCharges({
        chargeId,
        payload: {
          paymentType: payload.paymentType,
          ...(payload.paymentType === "WALLET" && { pin: payload.pin }),
          ...(payload.paymentType === "CARD" && {
            returnUrl: window.location.href,
          }),
        },
      });

      if (payload.paymentType === "CARD") {
        const accessCode = res?.data?.data?.accessCode;
        if (!accessCode) {
          toast.error("Payment could not be started: missing access code.");
          return;
        }

        // Close our modal first so Paystack's popup isn't fighting our overlay
        closeShippingFlow();

        await openPaystackPopup(
          accessCode,
          async ({ reference }) => {
            await confirmPayment.mutateAsync(reference);
            toast.success("Shipping charge paid");
          },
          () => toast.error("Payment cancelled"),
        );
        return;
      }

      // WALLET
      toast.success("Shipping charge paid");
      closeShippingFlow();
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(
        err.response?.data?.message ??
          err.message ??
          "Something went wrong, please try again",
        toastOpts,
      );
    }
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (shippingValues.paymentType === "WALLET") {
      setshippingStep(2); // go to PIN step
      return;
    }

    await payShippingCharge({ paymentType: "CARD", pin: "" });
  };

  return (
    <div className="max-h-[85vh] flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="pb-4 mb-4 border-b border-(--border-default) flex items-start justify-between gap-3 pr-8">
        <div className="min-w-0">
          <h2 className="text-xl font-bold">Order #{order.order.id}</h2>
          <p className="text-xs text-(--text-muted) mt-0.5">
            Placed {formatFullDate(order.order.createdAt)}
            <span className="hidden sm:inline">
              {" "}
              ({formatTimeAgo(order.order.createdAt)})
            </span>
          </p>
        </div>

        <Badge
          variant={getOrderStatusVariant(order.order.status)}
          className="font-semibold w-fit shrink-0"
        >
          {order.order.status.replaceAll("_", " ")}
        </Badge>
      </header>

      {/* ================= BODY (scrolls) ================= */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-6">
        {/* Items */}
        <section aria-labelledby="order-items">
          <h3 id="order-items" className="text-sm font-semibold mb-3">
            Items{" "}
            <span className="text-(--text-muted) font-normal">
              ({itemCount})
            </span>
          </h3>

          <ul className="space-y-3">
            {groupedProducts.map((product) => (
              <li
                key={product.product.id}
                className="border border-(--border-default) rounded-xl p-4"
              >
                <div className="flex gap-4">
                  {product.product.images?.[0] ? (
                    <img
                      src={product.product.images[0]}
                      alt={product.product.name}
                      loading="lazy"
                      className="w-20 h-20 object-cover rounded-lg shrink-0 bg-(--bg-muted)"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg shrink-0 bg-(--bg-muted)" />
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold line-clamp-2">
                      {product.product.name}
                    </h4>

                    <p className="mt-1 text-sm text-(--text-muted)">
                      {formatCurrency(product.unitPrice)} ×{" "}
                      {product.totalQuantity}
                    </p>

                    <p className="mt-1 font-semibold text-(--primary)">
                      {formatCurrency(product.totalPrice)}
                    </p>
                  </div>
                </div>

                {/* Variants */}
                {Object.keys(product.colors).length > 0 && (
                  <div className="mt-4 pt-3 border-t border-(--border-default) space-y-2">
                    {Object.values(product.colors).map((colorGroup, index) => (
                      <div
                        key={index}
                        className="flex flex-wrap items-center gap-2"
                      >
                        {colorGroup.color?.color && (
                          <span className="text-sm text-(--text-muted) mr-1">
                            {colorGroup.color.color}
                          </span>
                        )}
                        {colorGroup.sizes.map((sizeItem, i) => (
                          <Badge key={i}>
                            {sizeItem.size?.label
                              ? `Size ${sizeItem.size.label}`
                              : "Qty"}{" "}
                            × {sizeItem.quantity}
                          </Badge>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Tracking */}
        {trackingHref && (
          <section
            aria-labelledby="order-tracking"
            className="border border-(--border-default) rounded-xl p-4 space-y-3"
          >
            <h3 id="order-tracking" className="text-sm font-semibold">
              Track your order
            </h3>

            {trackingToken && (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-(--text-muted)">Tracking token</p>
                  <p className="font-mono text-sm truncate">{trackingToken}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyTrackingToken(trackingToken)}
                  aria-label="Copy tracking token"
                  className="shrink-0 p-2 rounded-lg text-(--text-muted) hover:bg-(--bg-muted) cursor-pointer"
                >
                  <RiFileCopyLine size={18} />
                </button>
              </div>
            )}

            {/* Plain <a>: /track/<token> is read from window.location (static export), so a full navigation is intended */}
            <a
              href={trackingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--primary) hover:underline"
            >
              View tracking
              <RiExternalLinkLine size={16} />
            </a>
          </section>
        )}

        {/* Remaining payments (moved inside the scroll area so it can't push the invoice off-screen) */}
        {order.installments.length > 0 && (
          <section aria-labelledby="order-installments">
            <h3 id="order-installments" className="text-sm font-semibold mb-3">
              Remaining payments
            </h3>
            <div className="overflow-auto border border-(--border-default) rounded-xl">
              <Table aria-label="Installment Table">
                <TableHeader>
                  <TableRow>
                    <TableColumn>Due date</TableColumn>
                    <TableColumn>Amount</TableColumn>
                    <TableColumn>Interest</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>Action</TableColumn>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.installments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatShortDate(payment.dueDate!)}</TableCell>
                      <TableCell>
                        {formatCurrency(Number(payment.amount))}
                      </TableCell>
                      <TableCell>{payment.interest}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getOrderStatusVariant(payment.status!)}
                          className="font-semibold w-fit"
                        >
                          {payment.status!.replaceAll("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          className="py-2! px-3! rounded-xl"
                          onClick={initiateInstallmentPayment}
                          disabled={
                            isPaymentPending || payment.status == "PAID"
                          }
                        >
                          {isPaymentPending ? "Starting…" : "Pay now"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        )}

        {/* Delivery method */}
        <section
          aria-labelledby="delivery-method"
          className="border border-(--border-default) rounded-xl p-4 space-y-3"
        >
          <h3 id="order-tracking" className="text-sm font-semibold">
            Delivery Method
          </h3>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="min-w-0">
              <p className="text-xs text-(--text-muted)">Delivery Method</p>
              <p className="font-mono text-sm truncate">
                {deliveryMethod != null ? deliveryMethod : "No method yet"}
              </p>
            </div>
            <Button className="mt-3 md:mt-0" primary onClick={() => setModalType("delivery-method")}>
              {deliveryMethod == null
                ? "Add delivery method"
                : "Change delivery method"}
            </Button>
          </div>
        </section>

        {/* Shipping */}
        <div className="space-y-3">
          {order.shipping.status !== "READY" && order.shipping.message && (
            <p className="text-sm text-(--text-muted)">
              {order.shipping.message}
            </p>
          )}

          {/* {charges.length > 0 && (
            <div className="flex justify-between items-center text-sm font-semibold px-1">
              <span>Amount due</span>
              <span>{formatNgn(order.shipping.amountDueNgn)}</span>
            </div>
          )} */}

          {charges.map((c) => {
            const isVoided = c.voidedAt != null;
            const isPaid = c.paidAt != null;

            return (
              <Card key={c.id} className="p-4! shadow-none">
                <h3 className="mb-2 text-sm font-semibold">Shipping details</h3>
                <div className="border border-(--border-default) rounded-2xl">
                  <div className="flex justify-between items-center bg-(--primary-soft) rounded-t-2xl p-3">
                    <div>
                      <p className="font-bold">
                        {c.serviceLabel} · {c.goodsTypeLabel}
                      </p>
                      <p className="text-xs text-(--text-muted)">
                        {c.measuredValue} {c.unit} · {fmtDateTime(c.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="p-3">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <dt className="text-(--text-muted)">Status</dt>
                      <dd className="text-right">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            isVoided
                              ? "bg-red-100/50 text-red-500"
                              : isPaid
                                ? "bg-green-500/10 text-green-600"
                                : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {isVoided ? "VOIDED" : isPaid ? "PAID" : c.status}
                        </span>
                      </dd>

                      <dt className="text-(--text-muted)">Delivery Type</dt>
                      <dd className="text-right">
                        {c.deliveryMethod === "DOORSTEP"
                          ? `Doorstep${c.deliveryAddress ? `: ${c.deliveryAddress}` : ""}`
                          : "Pickup"}
                      </dd>

                      <dt className="text-(--text-muted)">
                        Freight (${c.freightUsd.toLocaleString()} @ ₦
                        {c.fxRate.toLocaleString()})
                      </dt>
                      <dd className="text-right">{formatNgn(c.freightNgn)}</dd>

                      <dt className="text-(--text-muted)">Clearing</dt>
                      <dd className="text-right">{formatNgn(c.clearingNgn)}</dd>

                      {c.doorstepNgn > 0 && (
                        <>
                          <dt className="text-(--text-muted)">Doorstep</dt>
                          <dd className="text-right">
                            {formatNgn(c.doorstepNgn)}
                          </dd>
                        </>
                      )}

                      {c.miscNgn > 0 && (
                        <>
                          <dt className="text-(--text-muted)">Misc</dt>
                          <dd className="text-right">{formatNgn(c.miscNgn)}</dd>
                        </>
                      )}

                      <dt className="border-t pt-1 font-semibold">Total</dt>
                      <dd className="border-t pt-1 text-right font-semibold">
                        {formatNgn(c.totalNgn)}
                      </dd>
                    </dl>

                    {c.note && (
                      <p className="mt-2 text-xs">
                        <span className="font-bold">Note: </span>
                        <span>{c.note}</span>
                      </p>
                    )}

                    {isPaid && (
                      <p className="mt-1 text-xs text-(--text-muted)">
                        Paid {fmtDateTime(c.paidAt!)}
                        {c.paidVia ? ` via ${c.paidVia}` : ""}
                      </p>
                    )}

                    {isVoided && (
                      <p className="mt-1 text-xs text-destructive">
                        Voided {fmtDateTime(c.voidedAt!)}
                        {c.voidReason ? `: ${c.voidReason}` : ""}
                      </p>
                    )}

                    {!isPaid && (
                      <Button
                        primary
                        className="mt-4"
                        onClick={() => {
                          setModalType("pay-shipping");
                          setChargeId(c.id);
                        }}
                      >
                        Pay Charge
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ================= FOOTER / INVOICE (pinned) ================= */}
      <footer className="mt-4 rounded-xl bg-(--bg-muted) p-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <h3 className="font-semibold">Invoice summary</h3>
          <span className="text-xs text-(--text-muted)">{paidPct}% paid</span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={paidPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Payment progress"
          className="h-1.5 w-full rounded-full bg-(--border-default) overflow-hidden"
        >
          <div
            className="h-full rounded-full bg-(--primary) transition-[width] duration-500"
            style={{ width: `${paidPct}%` }}
          />
        </div>

        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-(--text-muted)">Total amount</dt>
            <dd className="font-medium">{formatCurrency(totalAmount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-(--text-muted)">Amount paid</dt>
            <dd className="font-medium">{formatCurrency(amountPaid)}</dd>
          </div>
          <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-(--border-default)">
            <dt className="font-semibold">Remaining balance</dt>
            <dd className="text-lg font-bold text-(--primary)">
              {formatCurrency(order.order.balanceDue)}
            </dd>
          </div>
        </dl>

        {(order.order.balanceDue > 0 && order.installments.length) === 0 && (
          <Button primary onClick={() => setModalType("confirm")}>
            Make Payment
          </Button>
        )}
      </footer>

      {modalType == "confirm" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeConfirmModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
            className="w-full max-w-md rounded-2xl bg-(--bg-default,white) p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="payment-modal-title" className="text-lg font-bold">
              Choose payment type
            </h3>
            <p className="text-sm text-(--text-muted) mt-1">
              Select how you want to pay for Order #{order.order.id}.
            </p>

            <div
              role="radiogroup"
              aria-label="Payment type"
              className="mt-4 space-y-2"
            >
              {paymentOptions.map((opt) => {
                const selected = action === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                      selected
                        ? "border-(--primary) bg-(--bg-muted) ring-1! ring-(--primary)!"
                        : "border-(--border-default) hover:bg-(--bg-muted)"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-type"
                      value={opt.value}
                      checked={selected}
                      onChange={() => setAction(opt.value)}
                      className="mt-1 accent-(--primary)"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {opt.label}
                      </span>
                      <span className="block text-xs text-(--text-muted)">
                        {opt.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                className="py-2! px-4! rounded-xl"
                onClick={closeConfirmModal}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="py-2! px-4! rounded-xl"
                onClick={handleConfirmPayment}
                disabled={!action || isPaymentPending}
              >
                {isPaymentPending ? "Starting…" : "Continue to payment"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {modalType == "delivery-method" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeConfirmModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delivery-modal-title"
            className="w-full max-w-xl rounded-2xl bg-(--bg-default,white) p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delivery-modal-title" className="text-lg font-bold">
              {deliveryMethod == null
                ? "Add Delivery Method"
                : "Change Delivery Method"}
            </h3>
            <p className="text-sm text-(--text-muted) mt-1">
              Select a delivery method for Order #{order.order.id}.
            </p>

            <form onSubmit={handleDeliverySubmit}>
              <div className="">
                <Input
                  element="input"
                  input_type="radio"
                  name="method"
                  value={deliveryValues.method}
                  handler={handleChange}
                  radioOptions={radioOptions}
                  tag="Delivery Method"
                  required
                />

                {deliveryValues.method == "DOORSTEP" && (
                  <Input
                    element="select"
                    name="deliveryAddressId"
                    value={deliveryValues.deliveryAddressId!}
                    handler={handleChange}
                    selectOptions={deliveryOptions}
                    tag="Select Address"
                  />
                )}
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <Button
                  type="button"
                  className="py-2! px-4! rounded-xl"
                  onClick={closeConfirmModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="py-2! px-4! rounded-xl"
                  disabled={deliveryPending}
                >
                  {deliveryPending ? "Adding delivery method…" : "Add method"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType == "pay-shipping" && shippingStep === 1 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeShippingFlow}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pay-modal-title"
            className="w-full max-w-md rounded-2xl bg-(--bg-default,white) p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="pay-modal-title" className="text-lg font-bold">
              Pay shipping charge
            </h3>
            <p className="text-sm text-(--text-muted) mt-1">
              Choose how you want to pay for Order #{order.order.id}
              {selectedCharge ? ` (${formatNgn(selectedCharge.totalNgn)})` : ""}
              .
            </p>

            <form onSubmit={handleShippingSubmit}>
              <div
                role="radiogroup"
                aria-label="Payment type"
                className="mt-4 space-y-2"
              >
                {shipOptions.map((opt) => {
                  const selected = shippingValues.paymentType === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                        selected
                          ? "border-(--primary) bg-(--bg-muted) ring-1! ring-(--primary)!"
                          : "border-(--border-default) hover:bg-(--bg-muted)"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping-payment-type"
                        value={opt.value}
                        checked={selected}
                        onChange={() =>
                          setShippingValues({
                            ...shippingValues,
                            paymentType:
                              opt.value as PayShippingPayload["paymentType"],
                          })
                        }
                        className="mt-1 accent-(--primary)"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">
                          {opt.label}
                        </span>
                        <span className="block text-xs text-(--text-muted)">
                          {opt.value === "WALLET"
                            ? `${opt.description} · Balance: ${
                                isWalletPending
                                  ? "Loading…"
                                  : walletData?.wallet_balance != null
                                    ? formatNgn(walletData.wallet_balance)
                                    : "—"
                              }`
                            : opt.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <Button
                  type="button"
                  className="py-2! px-4! rounded-xl"
                  onClick={closeShippingFlow}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="py-2! px-4! rounded-xl"
                  disabled={chargePending}
                >
                  {chargePending
                    ? "Starting…"
                    : shippingValues.paymentType === "WALLET"
                      ? "Continue"
                      : "Pay with card"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType == "pay-shipping" && shippingStep === 2 && (
        <WalletPinModal
          open
          amount={selectedCharge ? formatNgn(selectedCharge.totalNgn) : ""}
          isLoading={chargePending}
          onConfirm={(pin) => payShippingCharge({ paymentType: "WALLET", pin })}
          onClose={() => setshippingStep(1)}
        />
      )}
    </div>
  );
};

export default SingleOrder;