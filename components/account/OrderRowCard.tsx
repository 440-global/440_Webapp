"use client";

import type { OrderList } from "@/types/checkout";
import { Badge } from "@/components/ui";
import { getOrderStatusVariant } from "./orderStatusBadge";
import { format } from "date-fns";
import { useState } from "react";
import { RiArrowRightSLine, RiImageLine } from "react-icons/ri";
import MyModal from "@/components/core/modal";
import SingleOrder from "./SingleOrder";

type Props = {
  order: OrderList;
};

export default function OrderRowCard({ order }: Props) {
  const [open, setOpen] = useState(false);

  const isBale = order.checkoutType === "BALE";
  const image = isBale
    ? order.bale?.product?.images?.[0]
    : order.products?.[0]?.images?.[0];
  const title = isBale ? order.bale?.product?.name : order.products?.[0]?.name;

  const dateLabel = (() => {
    try {
      return format(new Date(order.createdAt), "dd-MM-yy");
    } catch {
      return "";
    }
  })();

  return (
    <>
      <div className="relative flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition active:bg-gray-50 sm:gap-4 sm:p-4">
        {/* Thumbnail */}
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 sm:size-24">
          {image ? (
            <img
              src={image}
              alt={title ?? "Order item"}
              className="h-full w-full object-cover"
            />
          ) : (
            <RiImageLine className="text-2xl text-gray-400" />
          )}
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 sm:text-lg">
            {title ?? "Order"}
          </p>

          <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
            Order #{order.id}
            {dateLabel ? <span> · {dateLabel}</span> : null}
          </p>

          <Badge
            variant={getOrderStatusVariant(order.status)}
            className="mt-2 w-fit text-[11px] font-semibold uppercase sm:text-xs"
          >
            {order.status.replaceAll("_", " ")}
          </Badge>
        </div>

        {/* Affordance: chevron on mobile, text link on larger screens */}
        <RiArrowRightSLine className="shrink-0 text-xl text-gray-400 sm:hidden" />
        <span className="hidden shrink-0 text-sm font-semibold text-(--primary) sm:block">
          See details
        </span>

        {/* Stretched button: makes the whole card tappable */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`View details for order ${order.id}`}
          className="absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
        />
      </div>

      <MyModal isModalOpen={open} setIsModalOpen={setOpen}>
        {open ? <SingleOrder orderId={order.id} /> : null}
      </MyModal>
    </>
  );
}
