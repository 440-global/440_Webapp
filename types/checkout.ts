export type CheckoutPayload = {
  totalAmount: number;
  primaryAmount: number;
  totalShippingFee: number;
  deliveryAddressId: number;
  totalQuantity: number;
  bales: CheckoutBale[];
  merchantId: number;
};

export type CheckoutBaleInfo = {
  id: number;
  baleId: string;
  price: number;
  filledSlot: number;
  quantity: number;
  product: {
    name: string;
    images: string[];
  };
  items: BaleItem[];
};

export type CheckoutBale = {
  quantity: number;
  price: number;
  totalPrice: number;
  bale: CheckoutBaleInfo;
};

export type Bale = {
  id: number;
  productId: number;
  quantity: number;
  filled: number;
  slot: number;
  filledSlot: number;
  price: number;
  oldPrice: number;
  totalDeliveryFee: number;
  deliveryFee: number;
  baleId: string;
  endIn: string; // ISO date
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  product: Product;
  items: BaleItem[];
};

export type Product = {
  id: number;
  supplierId: number;
  subCategoryId: number;
  price: number;
  oldPrice: number;
  name: string;
  description: string;
  status: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type BaleItem = {
  size: ProductSize;
  color: ProductColor;
  quantity: number;
  totalPrice: number;
};

export type ProductSize = {
  id: number;
  label: string;
  formart: string; // keeping backend typo for compatibility
  type: "shoe" | "clothing" | "bulk";
};

export type ProductColor = {
  id: number;
  productId: number;
  color: string;
  otherColor: string;
  images: string[];
  status: boolean;
};

type CartItemSize = {
  id: number;
  label: string;
  type: string | null;
  formart: string;
};

type CartItemColor = {
  id: number;
  color: string;
  images: string[];
  productId: number;
  status: boolean;
};

export type CartItemVariant = {
  size?: CartItemSize;
  color?: CartItemColor;
  quantity: number;
  totalPrice: number;
};

export type CartItem = {
  productId: number;
  baleId: number;
  slots: number;
  items: CartItemVariant[];
};

export const ORDER_STATUSES = [
  "all",
  "CREATED",
  "LOCKED",
  "AWAITING_BALANCE",
  "PARTIALLY_PAID",
  "PAID_IN_FULL",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
  "DEFAULTED",
  "DISPUTE_RAISED",
] as const;

export type OrderStatuses = (typeof ORDER_STATUSES)[number];

export type OrderStatus =
  | "CREATED"
  | "LOCKED"
  | "AWAITING_BALANCE"
  | "PARTIALLY_PAID"
  | "PAID_IN_FULL"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED"
  | "DEFAULTED"
  | "DISPUTE_RAISED"
  | "all";

export type Order = {
  id: number;
  checkoutId: number;
  baleId: number | null;
  shipmentId: string | null;
  status: OrderStatus;
  lockPaymentId: number | null;
  totalAmount: number;
  amountPaid: number;
  paymentOption: "split" | "full";
  upfrontPercent: number;
  customerId: number;
  paymentStatus: string;
  source: string;
  reference: string;
  interestRate: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  balanceDue: number;
  trackingUrl: string;
  trackingToken: string;
  deliveryMethod: string | null;
};

export type Installments = {
  id?: number;
  sequence?: number;
  dueDate?: string;
  amount?: number;
  interest?: number;
  penalty?: number;
  status?: OrderStatus;
  paidAt?: string | null;
};

export type History = {
  id: number;
  orderId: number;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  actor: "SYSTEM";
  createdBy: number;
  createdAt: string;
  updatedAt: string;
};

export type OrderList = {
  id: number;
  checkoutId: number;
  baleId: number | null;
  shipmentId: string | null;
  status: OrderStatus;
  lockPaymentId: number | null;
  totalAmount: number | null;
  amountPaid: number | null;
  paymentOption: "split" | "full";
  upfrontPercent: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  bale: {
    price: number;
    status: "OPEN" | "CLOSED" | "COMPLETED";
    filledSlots: number;
    slots: number;
    quantity: number;
    itemsPerSlot: number;
    endDate: string | null;
    product: {
      name: string;
      images: string[];
    };
  } | null;
  products?: {
    id: number;
    name: string;
    images: string[];
    price: number;
    oldPrice: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    color: {
      id: number;
      color: string;
      otherColor: string | null;
      hex_code: string | null;
      images: string[];
    } | null;
    size: {
      id: number;
      label: string;
      formart: string;
      type: string | null;
    } | null;
  }[];
  checkoutType: "DIRECT" | "BALE";
  slotCount: number | null;
  itemsPerSlot: number;
  totalItemsInOrder: number | null;
  remaining: number | null;
};

export type DirectOrderPayload = {
  items: {
    productId: number;
    colorId: number | null;
    sizeId: number | null;
    quantity?: number;
  }[];
  paymentOption: "split" | "full";
  upfrontPercent: number;
  deliveryAddressId: number;
};

export type DirectInitiate = {
  type: "full-remaining";
  id?: number;
};

export type PaymentAction =
  | "LOCK"
  | "HALF"
  | "FULL"
  | "UPFRONT"
  | "REMAINDER"
  | "INSTALLMENT_ENTRY";

/**
 * POST /buyer/initiate-payment
 * - BALE + LOCK|HALF|FULL → checkoutId (from checkout-intent response checkout.id)
 * - DIRECT + UPFRONT|REMAINDER|INSTALLMENT_ENTRY → orderId (from direct-order response orders[0].id)
 * - WALLET → pin required; CARD / Paystack omit pin
 */
export type InitiatePayment = {
  flowType: "BALE" | "DIRECT";
  action: PaymentAction;
  paymentType?: "WALLET" | "CARD";
  pin?: string | null;
  checkoutId?: number;
  returnUrl?: string;
  orderId?: number;
};

export type OrderDetails = {
  order: Order;
  items: {
    id: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    product: {
      id: number;
      name: string;
      images: string[];
      price: number;
      oldPrice: number;
    };
    color: {
      id: number;
      color: string;
      otherColor: string | null;
      hex_code: string | null;
      images: string[];
    };
    size: {
      id: number;
      label: string;
      formart: string;
      type: string | null;
    };
  }[];
  history: History[];
  installments: Installments[];
  shipping: OrderShipping;
};

type ShippingCharge = {
  id: number;
  status: string;
  service: string;
  serviceLabel: string;
  goodsType: string;
  goodsTypeLabel: string;
  unit: string;
  measuredValue: number;
  freightRateUsd: number;
  freightUsd: number;
  fxRate: number;
  freightNgn: number;
  clearingRateNgn: number;
  clearingNgn: number;
  doorstepNgn: number;
  miscNgn: number;
  totalNgn: number;
  deliveryMethod: "DOORSTEP" | "PICKUP";
  deliveryAddress: string | null;
  note: string | null;
  paidAt: string | null;
  paidVia: string | null;
  createdAt: string;
  voidedAt?: string | null;
  voidReason?: string | null;
};

type OrderShipping = {
  status: string;
  message: string | null;
  deliveryMethod: "DOORSTEP" | "PICKUP";
  amountDueNgn: number;
  charges: ShippingCharge[];
};

export type PaymentPreviewResponse = {
  success: boolean;
  message: string;
  data: {
    checkoutId: 12;
    flowType: "BALE";
    status: "CREATED";
    currency: string;
    items: [
      {
        baleId: 7;
        productName: string;
        image: string;
        slotQuantity: 3;
        unitsPerSlot: 10;
        grossTotal: 30000;
        discountRate: 0.045;
        discountPercent: 4.5;
        discountAmount: 1350;
        total: 28650;
        nextTier: { slotQuantity: 4; discountPercent: 6 };
      },
    ];
    subtotal: 30000;
    discountTotal: 1350;
    total: 28650;
    options: [
      {
        action: "LOCK";
        payNow: 2865;
        thenDue: 25785;
        whenPoolFills: {
          payBalance: 25785;
          installmentEntry: 11460;
          installments: [7520.63, 7520.63];
          interestRate: 0.05;
        };
      },
      {
        action: "HALF";
        payNow: 14325;
        installments: [7520.63, 7520.63];
        interestRate: 0.05;
        totalPayable: 29366.26;
      },
      { action: "FULL"; payNow: 28650 },
    ];
    shipping: {
      status: "PENDING";
      message: string;
    };
  };
};

export type DeliveryMethodPayload = {
  method: "PICKUP" | "DOORSTEP";
  deliveryAddressId?: number;
};

export type PayShippingPayload = {
  paymentType: "WALLET" | "CARD" | "OTHER";
  pin?: string;
  returnUrl?: string;
};