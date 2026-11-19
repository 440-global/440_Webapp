import http from "@/lib/http";
import {
  CheckoutPayload,
  DeliveryMethodPayload,
  DirectInitiate,
  DirectOrderPayload,
  InitiatePayment,
  OrderDetails,
  OrderList,
  PayShippingPayload,
} from "@/types/checkout";
import { BaleSlot, DeliveryPayload, Initiate } from "@/types/types";
import { useMutation, useQuery, queryOptions, useQueryClient } from "@tanstack/react-query";

const isProd = process.env.NODE_ENV === "production";

type PayShipping = {
  chargeId: number
  payload: PayShippingPayload
}

// Deliveries
export const useDeliveryMutation = () => {
  return useMutation({
    mutationFn: ({ merchantId, ...body }: DeliveryPayload) => {
      return http.post(`/buyer/delivery?merchantId=${merchantId}`, body);
    },
  });
};

export const useGetDeliveries = () => {
  return useQuery({
    queryKey: ["delivery"],
    queryFn: async () => {
      const res = await http.get("/buyer/deliveries");
      return res?.data?.data ?? [];
    }
  });
}

export const useOrderMutation = () => {
  return useMutation({
    mutationFn: ({merchantId, ...body}: CheckoutPayload) => {
      return http.post(`/buyer/order?merchantId=${merchantId}`, body);
    },
  });
};

// Slot payment endpoints
// Create Bale slot
export const useCreateBaleSlot = () => {
  return useMutation({
    mutationFn: (body: BaleSlot) => {
      return http.post(`/buyer/checkout-intent`, body);
    },
  });
};

export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: ({ body, idempotencyKey }: { body: InitiatePayment, idempotencyKey: string }) => {
      return http.post(`/buyer/initiate-payment`, body, {
        headers: { 'Idempotency-Key': idempotencyKey },
        params: { domain: isProd ? "live" : "test" }
      });
    },
  });
};

// Confirm Payment
export const useConfirmPayment = () => {
  return useMutation({
    mutationFn: async (reference: string) => {
      const res = await http.get(
        `/buyer/confirm-payment?reference=${reference}`
      );
      return res?.data?.data;
    }
  });
};
// End of slot payment endpoints

// Orders
export const useGetAllOrders = () => {
  return useQuery<OrderList[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await http.get("/buyer/orders");
      return res?.data?.data?.data ?? [];
    },
  });
};

export const useGetSingleOrder = (orderId: number) => {
  return useQuery<OrderDetails>({
    queryKey: ["orders", orderId],
    queryFn: async () => {
      const res = await http.get(`/buyer/orders/${orderId}`);
      return res?.data?.data;
    },
    enabled: !!orderId
  });
};
// End of orders

// Direct Order Endpoints
export const useDirectOrder = () => {
  return useMutation({
    mutationFn: (body: DirectOrderPayload) => {
      return http.post('/buyer/direct-order', body);
    }
  });
}

export const useInitiateDirectPayment = () => {
  return useMutation({
    mutationFn: ({ type, id }: DirectInitiate) => {
      return http.post(`/buyer/direct-order/${id}/initiate-payment`, {type});
    },
  });
};

export const paymentPreviewOptions = (checkoutId: number) =>
  queryOptions({
    queryKey: ["payment-preview", checkoutId],
    queryFn: async ({ signal }) => {
      const res = await http.get(
        `/buyer/checkout/${checkoutId}/payment-preview`,
        { signal },
      );
      return res.data;
    },
  });

// Still available for components that render the preview
export const useGetPaymentPreview = (checkoutId: number | undefined) =>
  useQuery({
    ...paymentPreviewOptions(checkoutId as number),
    enabled: checkoutId != null,
  });

// export const usePayInstallments = () => {
//   return useMutation({
//     mutationFn: (orderId: number) => {
//       return http.post(`/buyer/orders/${orderId}/initiate-balance-installment-payment`);
//     }
//   });
// };

export const useAddDeliveryMethod = (orderId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: DeliveryMethodPayload) => {
      return await http.patch(`/buyer/orders/${orderId}/delivery-method`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['orders', orderId]
      });
    },
  });
};

export const usePayOrderShippingCharges = (orderId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: PayShipping) => {
      return await http.post(
        `/buyer/orders/${orderId}/shipping-charges/${body.chargeId}/initiate-payment`,
        body.payload,
        {
          headers: { "Idempotency-Key": crypto.randomUUID() },
          params: { domain: isProd ? "live" : "test" },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders", orderId],
      });
    },
  });
};