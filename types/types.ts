// Toast Types
export type ToastVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

export type ToastPlacement = "top-right" | "bottom-right";

export type ToastItem = {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
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
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
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
  endIn: string; // ISO date string
  status: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  product: Product;
};

export type Login = {
  identifier: string;
  email?: string;
  phone?: string;
  password: string;
};

export type PhoneResetPayload = {
  phone: string;
  otp: string;
  password: string;
  confirmPassword: string;
};

type Flag = 0 | 1;

export type MinorMerchant = {
  id: number;
  name: string;
  email: string;
  phone: string;
  picture: string | null;
  address: string;
};

export type Merchant = {
  id: number;
  agent_id: number | null;
  manager_id: number | null;
  name: string;
  shop_name: string;
  slug: string;
  store_link: string | null;
  registered_with: string | null;
  email: string;
  phone: string;
  picture: string | null;
  whatsapp_no: string | null;
  instagram_phone: string | null;
  whatsapp_link: string | null;
  whatsapp_buy_link: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  jumia: string | null;
  jiji: string | null;
  konga: string | null;
  address: string | null;
  state: string | null;
  country_id: number | null;
  business_type: string | null;
  bank_code: number | null;
  bank_id: number | null;
  account_name: string | null;
  account_number: number | null;
  generated_account_number: number | null;
  interests: string[] | null;
  global_catalogue_link: string | null;
  added_global_items: string | null;
  upfront_rate: number | null;
  monthly_interest_rate: number | null;
  max_credit_duration: number | null;
  banner_image: string | null;
  banner_title: string | null;
  banner_subtitle: string | null;
  sections: Record<string, unknown> | null;
  items_display: string | null;
  theme_color: string | null;
  template: string | null;
  filter_position: string | null;
  details_template: string | null;
  collection_banner: boolean;
  show_product_comments: boolean;
  show_product_ratings: boolean;
  online: boolean | null;
  other_platforms: boolean | null;
  store_photo: string | null;
  whatsapp_stage: string | null;
  bot_name: string | null;
  top_category_one: number | null;
  top_category_three: number | null;
  sender_id: number | null;
  temporary_bot: string | null;
  location: string | null;
  id_card: string | null;
  description: string | null;
  step: number;
  sla_link: string | null;
  OWNER: string | null;
  sla: string | null;
  telemarketer: string | null;
  feedback_type: string | null;
  feedback_comments: string | null;
  opinion: string | null;
  kyc_request_id: number | null;
  credit_limit: number | null;
  social_credit_limit: number | null;
  daily_sales: number | null;
  business_model: string | null;
  employees: unknown[] | null;
  credit_amount: number | null;
  offer: number | null;
  account_credit_limit: number | null;
  social_credit_position: string | null;
  categories: unknown[] | null;
  sub_categories: unknown[] | null;
  assigned_telemarketer: string | null;
  providus: string | null;
  majorLandmark: string | null;
  lga: string | null;
  title: string | null;
  account_tier: number;
  store_video: string | null;
  CAC: string | null;
  market_name: string | null;
  app_version: string;
  user_type: string;
  home_address: string | null;
  market: string | null;
  gift_balance: number | null;
  utility_bill: string | null; // was number; this is almost certainly a file URL
  dob: string | null;
  nin_slip: string | null;
  account_source: string;
  created_by_admin_id: number | null;

  // 0 | 1 flags
  email_validated: Flag;
  phone_validated: Flag;
  whatsapp_validated: Flag;
  instagram_phone_validated: Flag;
  verified: Flag;
  uses_global: Flag;
  popular_products_activated: Flag;
  partnership: Flag;
  interest_on_total: number | null;
  interest_on_balance: number | null;
  orders_notify: Flag | null;
  repayments_notify: Flag | null;
  internal: Flag;
  eligibility: Flag;
  collection: Flag;
  insurance: Flag;
  widget: Flag;
  is_approved: Flag;
  WANT_UPFRONT: Flag;
  SLA_SIGNED: Flag;
  deleted: Flag;
  feedback_provided: Flag;
  valid_token: Flag;
  kyc: Flag;
  kyc_form: Flag;
  has_offer: Flag;
  publisher: Flag;
  reseller: Flag;
  instagram_connected: Flag;
  jiji_connected: Flag;
  jumia_connected: Flag;
  konga_connected: Flag;
  address_verified: Flag;
  source: number;
  million_credit: Flag;
  wholesale: Flag;
  is_staff: Flag;
  is_support: Flag;
  is_440: Flag;
  download_status: number;
  has_won: Flag;
  flag: Flag;
  approved_profile: Flag;
  approved_id: Flag;
  approved_nin_slip: Flag;
  approved_utility_bill: Flag;
  approved_store: Flag;
  approved_cac: Flag;
  status: number;
  must_change_password: Flag;
  added_bvn: Flag;

  // dates (serialized as strings)
  created_at: string | null;
  feedback_date: string | null;
  credit_limit_expiry_date: string | null;
  last_sms_sent: string | null;
  win_date: string | null;
  last_login: string | null;
  createdAt: string;
  updatedAt: string;
  password_changed_at: string | null;
  temp_password_expires_at: string | null;
  welcome_sent_at: string | null;

  // tokens / codes
  phone_token: string | null;
  password_reset_link: string | null;
  whatsapp_code: string | null;
  partnership_email_token: string | null;
  email_change_otp: string | null;
  phone_change_otp: string | null;
  code: string | null;
  token: string | null;
  withdrawal_token: string | null;

  accounts: unknown[] | null;
  banner_slides: unknown[];
  loan: unknown | null;

  jumia_username: string | null;
  konga_username: string | null;
  jiji_username: string | null;
  instagram_username: string | null;
  Amazon: boolean;
  Amazon_username: string | null;
  Olist: boolean;
  Olist_username: string | null;
  Ebay: boolean;
  Ebay_username: string | null;
  loan_status: boolean;
  play_today: boolean;

  completion_details: {
    score: number;
    picture: boolean;
    bank_details: boolean;
    business_details: boolean;
    phone_validated: boolean;
    name: string;
    phone: string;
    business_type: string | null;
    global_catalogue_link: string | null;
  };
};

export type RegisterPayload = {
  user_type: "individual" | "business";
  name: string;
  business_name: string;
  email: string;
  phone: string;
  referral_phone: string;
  password: string;
};

export type ChangePassword = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangePasswordAuth = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type CompletionDetails = {
  score: number;
  picture: boolean;
  bank_details: boolean;
  business_details: boolean;
  phone_validated: boolean;
  name: string;
  phone: string;
  business_type: number | null;
  global_catalogue_link: string | null;
};

export type Accounts = {
  id: number;
  merchant_id: number;
  wema: string;
  providus: string;
  kuda: string;
  keep_kuda: string;
  ninepsb: string;
  zenith: string;
  VFD: string;
  gtb: string;
  access: string;
  wema_account: string;
  moniepoint: string;
  sterling: string;
};

export type Loan = {
  id: number;
  agent_id: number | null;
  creditclan_request_id: number | null;
  amount: string;
  duration: number;
  stage: number;
  status: number;
  analysis_completed: any[];
  stages: any | null;
  disbursed: number;
  amount_disbursed: string | null;
  disbursement_date: string | null;
  created_at: string;
  offer: string | null;
  has_offer: number;
  partnership_status: number;
  assigned_staff: number;
  source: any | null;
  se_amount: any | null;
  fees_scenario: any | null;
  called_track: number;
  merchant_type: any | null;
  assessment_id: any | null;
};

export type ProfileData = {
  id: number;
  agent_id: number;
  manager_id: number | null;
  name: string;
  shop_name: string;
  slug: string;
  store_link: string | null;
  registered_with: number;
  email: string;
  email_validated: number;
  phone: string;
  phone_validated: number;
  phone_token: string | null;
  password_reset_link: string | null;
  picture: string | null;
  whatsapp_no: string | null;
  whatsapp_validated: number;
  instagram_phone: string | null;
  instagram_phone_validated: number;
  whatsapp_link: string | null;
  whatsapp_buy_link: string | null;
  facebook: string | null;
  instagram: boolean;
  twitter: string | null;
  jumia: boolean;
  jiji: boolean;
  konga: boolean;
  whatsapp_code: string | null;
  address: string;
  state: number;
  country_id: number | null;
  business_type: number | null;
  bank_code: number | null;
  bank_id: number | null;
  account_name: string;
  account_number: string;
  generated_account_number: string;
  verified: number;
  interests: any;
  uses_global: number;
  popular_products_activated: number;
  global_catalogue_link: string | null;
  added_global_items: any;
  partnership_email_token: string | null;
  partnership: number;
  upfront_rate: any;
  monthly_interest_rate: any;
  max_credit_duration: any;
  interest_on_total: number;
  interest_on_balance: number;
  orders_notify: number;
  repayments_notify: number;
  banner_image: string | null;
  banner_title: string | null;
  banner_subtitle: string | null;
  sections: any;
  items_display: any;
  theme_color: string;
  template: number;
  filter_position: any;
  details_template: any;
  collection_banner: boolean;
  publisher: number;
  show_product_comments: boolean;
  show_product_ratings: boolean;
  online: number;
  other_platforms: any;
  store_photo: string;
  internal: number;
  email_change_otp: any;
  phone_change_otp: any;
  eligibility: number;
  collection: number;
  insurance: number;
  widget: number;
  whatsapp_stage: any;
  bot_name: any;
  top_category_one: any;
  top_category_three: any;
  sender_id: any;
  temporary_bot: any;
  location: string;
  id_card: string;
  description: string | null;
  is_approved: number;
  step: number;
  code: string | null;
  WANT_UPFRONT: number;
  SLA_SIGNED: number;
  sla_link: string | null;
  OWNER: any;
  sla: any;
  deleted: number;
  created_at: string;
  telemarketer: any;
  feedback_provided: number;
  feedback_type: any;
  feedback_comments: any;
  feedback_date: any;
  opinion: any;
  token: string | null;
  valid_token: number;
  kyc: number;
  kyc_form: number;
  kyc_request_id: any;
  credit_limit: any;
  social_credit_limit: string;
  credit_limit_expiry_date: any;
  daily_sales: any;
  business_model: any;
  employees: any;
  credit_amount: any;
  has_offer: number;
  offer: any;
  instagram_connected: number;
  jiji_connected: number;
  jumia_connected: number;
  konga_connected: number;
  account_credit_limit: any;
  social_credit_position: any;
  address_verified: number;
  source: number;
  reseller: number;
  million_credit: number;
  categories: any;
  sub_categories: any;
  assigned_telemarketer: number;
  providus: string;
  majorLandmark: any;
  lga: any;
  title: any;
  withdrawal_token: any;
  last_sms_sent: string;
  account_tier: number;
  is_staff: number;
  store_video: any;
  CAC: any;
  added_bvn: number;
  market_name: string;
  wholesale: number;
  app_version: string;
  user_type: string;
  home_address: string;
  market: any;
  is_support: number;
  is_440: number;
  last_login: string;
  gift_balance: string;
  download_status: number;
  has_won: number;
  win_date: string;
  flag: number;
  utility_bill: any;
  dob: string;
  nin_slip: string;
  approved_profile: number;
  approved_id: number;
  approved_nin_slip: number;
  approved_utility_bill: number;
  approved_store: number;
  approved_cac: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  banner_slides: any[];
  accounts: Accounts;
  loan: Loan;
  jumia_username: string | null;
  konga_username: string | null;
  jiji_username: string | null;
  instagram_username: string | null;
  Amazon: boolean;
  Amazon_username: string | null;
  Olist: boolean;
  Olist_username: string | null;
  Ebay: boolean;
  Ebay_username: string | null;
  loan_status: boolean;
  play_today: boolean;
  completion_details: CompletionDetails;
};

export type ProfileResponse = {
  data: ProfileData;
  status: boolean;
};

export type CartItem = {
  cartItemId: string;
  productId: number;
  baleId: number;
  name: string;
  image: string;
  supplierId: number;
  price: number;
  originalPrice: number;
  discount: number;
  discountRate?: number;
  pooledPrice?: number;
  pooledSubtotal?: number;
  currency: string;
  slots: number;
  totalSlots: number;
  totalShippingFee: number;
  quantity: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  status: boolean;
  endIn: string;
  items: {}[];
  variants: Record<string, string | string[]>;
  minOrder?: number;
  subtotal?: number;
  inStock: boolean;
};

export type CartSizes = {
  sizeId: number;
  quantity: number;
};

export type CartColorObject = {
  colorId: number;
  quantity: number;
  sizes: CartSizes[];
};

export type SingleCartItemPayload = {
  productId: number;
  colorId?: number;
  quantity: number;
  sizes?: CartSizes[];
  colorSelections?: CartColorObject[];
  phone?: string;
  name?: string;
};

export type CartItemResponse = {
  id: number;
  product_id: number;
  color_id: number;
  sizes: CartSizeVariant[];
  quantity: number;
  unit_price: number;
  unit_shipping_fee: number;
  total_price: number;
  total_shipping_fee: number;
  product: {
    id: number;
    name: string;
    images: string[];
    price: number;
    shippingFee: number;
    currency: string;
    status: boolean;
  };
  color: {
    id: number;
    color: string;
    hex_code: string;
    images: string[];
  };
};

export type CartObject = {
  id: number;
  customer_id: number;
  status: string;
  items: CartItemResponse[];
  subtotal: number;
  totalShippingFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
};

export type CartSizeVariant = {
  sizeId: number;
  quantity: number;
  size: {
    id: number;
    label: string;
    type: string;
  };
};

export type CartResponse = {
  success: boolean;
  data: CartObject;
};

export type UpdateCartItemPayload = {
  quantity: number;
  sizes: CartSizes[];
};

type BaseOrderItem = {
  quantity: number;
  totalPrice: number;
};

export type Size = {
  id: number;
  label: string;
  format: string;
  type: string;
};

export type Color = {
  id: number;
  color: string;
  otherColor?: string;
  images: string[];
  status: boolean;
  productId: number;
};

export type OrderItem = ShoeItem | ClothingItem | BulkItem;

type ShoeItem = BaseOrderItem & {
  kind: "shoe";
  size: Size;
  color: Color;
};

type ClothingItem = BaseOrderItem & {
  kind: "clothing";
  size: Size;
  color?: Color;
};

type BulkItem = BaseOrderItem & {
  kind: "bulk";
};

// For the variants of different products
export type VariantAllocation = {
  size: string | null;
  color: string;
  quantity: number;
};

// For delivery form
export type DeliveryPayload = {
  id?: number;
  firstName: string;
  LastName: string;
  countryCode: string;
  phone: string;
  additionalCountryCode: string;
  additionalPhone: string;
  address: string;
  additionalInfo: string;
  region: string;
  city: string;
  state: string;
  setDefault: boolean;
  status?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  merchantId?: number;
};

// For order history
type OrderStatus = "shipped" | "delivered" | "processing" | "canceled";

type OrderedItem = {
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

export type Order = {
  orderId: string;
  baleId: string;
  productName: string;
  supplier: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
};

export type SizeItem = {
  sizeId: number;
  quantity: number;
};

export type BaleSlotItem = {
  baleId: number;
  slotQuantity: number;
  items: {
    colorId?: number | null;
    productSizes?: SizeItem[];
    productId: number;
    quantity?: number;
  }[];
};

export type BaleSlot = {
  deliveryAddressId: number | null;
  bales: BaleSlotItem[];
};

export type Initiate = {
  checkoutId: number;
  type: "lock";
};

export type FormValues = {
  sizes: string[];
  colors: string[];
  slots: number;
  directQty?: number;
};

type SizeAllocation = {
  sizeId: number;
  sizeLabel: string;
  quantity: number;
};

type ColorAllocation = {
  colorId: number;
  colorLabel: string;
  colorImages: string[];
  quantity?: number;
  sizes: Record<number, SizeAllocation>;
};

export type AllocationState = Record<number, ColorAllocation>;

// Categories
export type CategoryDetails = {
  id: number;
  name: string;
  categorySlug: string | null;
  priority: number | string;
  image: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export interface BaleFilters {
  page?: number;
  limit?: number;
  search?: string;
  productId?: number;
  isSpecial?: boolean;
  status?: "OPEN" | "CLOSED";
  shipmentId?: number;
  sortBy?: string;
  sortOrder?: any;
  start_date?: string;
  end_date?: string;
  categories?: number[];
  supplierRating?: string;
  marketLocation?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  productTypes?: number[];
  subCategories?: number[];
}

// Inspection Types ------------
export type InspectionDepth = "BASIC" | "STANDARD" | "COMPREHENSIVE";

export type InspectionProductDetails = {
  description: string;
  quantity: number;
  unit: string;
  specifications?: string;
};

export type InspectionStatus =
  | "SUBMITTED"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "REPORT_READY"
  | "COMPLETED"
  | "REJECTED"
  | "REJECTED"
  | "REFUNDED"
  | "CANCELLED";

export type AttachmentKind =
  | "INVOICE"
  | "QUOTATION"
  | "RECEIPT"
  | "SCREENSHOT"
  | "PHOTO"
  | "VIDEO"
  | "REPORT"
  | "OTHER";

export type InspectionRequestType = {
  depth: InspectionDepth;
  supplier: {
    name: string;
    address: string;
    contact?: string;
  };
  productDetails: InspectionProductDetails;
  pin: string;
  attachments?: {
    url: string;
    kind: AttachmentKind;
    note: string;
  }[];
};

export type InspectionParams = {
  status: InspectionStatus;
  depth: InspectionDepth;
  page: number;
  limit: number;
};

export type SingleInspection = {
  id: number;
  reference: string;
  merchantId: number;
  depth: InspectionDepth;
  feePaidNaira: number;
  supplier: {
    name: string;
    address: string;
    contact: string;
  };
  productDetails: InspectionProductDetails;
  attachments: {
    url: string;
    kind: string;
    uploadedBy: string;
    uploadedById: number;
    uploadedAt: string;
    note: string;
  }[];
  status: InspectionStatus;
  assignedAdminId: number;
  report: string | null;
  adminNotes: string;
  wallet: {
    debitTxnId: string;
    refundTxnId: string | null;
  };
  history: {
    from: InspectionStatus;
    to: InspectionStatus;
    actorType: "MERCHANT";
    actorId: number;
    note: string;
    at: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

type SupplierDetails = {
  supplierName: string;
  supplierAddress: string;
  contactInformation: string;
};

type ProductDetails = {
  productDescription: string;
  quantity: number;
  specifications?: string;
};

type InspectionAttachment = {
  invoiceOrPO?: string | null;
};

export type OrderInspectionPayload = SupplierDetails &
  ProductDetails &
  InspectionAttachment & {
    inspectionDepth: InspectionDepth | "";
    acceptedTerms: boolean;
  };

// Review ----------------
export type ReviewPayload = {
  buyerId: number;
  productId: number;
  rating: number;
  note: string;
};

// Save Product --------
export type SaveProductPayload = {
  productId: number;
  merchantId: number;
};

// Analytics ----------------
export type AnalyticsSource =
  | "web"
  | "mobile_ios"
  | "mobile_android"
  | "server";

export type AnalyticsPlatform = "ios" | "android" | "web";

export type UserAnalyticsEvent = "USER_REGISTERED" | "USER_LOGIN";

export type ProductAnalyticsEvent = "PRODUCT_VIEWED" | "PRODUCT_LIST_VIEWED";

export type WishListAnalyticsEvent = "PRODUCT_SAVED" | "PRODUCT_UNSAVED";

export type CartAnalyticsEvent =
  | "CART_ITEM_ADDED"
  | "CART_ITEM_REMOVED"
  | "CART_CLEARED";

export type SearchAnalyticsEvent = "SEARCH_PERFORMED";

export type CheckoutAnalyticsEvent = "CHECKOUT_CREATED" | "CHECKOUT_ABANDONED";

export type PaymentAnalyticsEvent =
  | "PAYMENT_INITIATED"
  | "PAYMENT_COMPLETED"
  | "PAYMENT_FAILED";

export type OrderAnalyticsEvent =
  | "ORDER_CREATED"
  | "ORDER_STATUS_CHANGED"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"
  | "REVIEW_SUBMITTED"
  | "INSTALLMENT_PAYMENT_INITIATED";

export type BaleAnalyticsEvent = "BALE_JOINED";

export type RFQAnalyticsEvent = "RFQ_CREATED" | "RFQ_VIEWED";

export type AnalyticsEvent =
  | UserAnalyticsEvent
  | ProductAnalyticsEvent
  | WishListAnalyticsEvent
  | CartAnalyticsEvent
  | SearchAnalyticsEvent
  | CheckoutAnalyticsEvent
  | PaymentAnalyticsEvent
  | OrderAnalyticsEvent
  | BaleAnalyticsEvent
  | RFQAnalyticsEvent;

export type AnalyticsPayload = {
  event_id: string;
  event_name: AnalyticsEvent;
  session_id: string;
  source: AnalyticsSource;
  resource_type?: string;
  resource_id?: string;
  properties: {
    price?: number;
    currency?: string;
    category?: string;
    additionalProp1?: {};
  };
  platform: AnalyticsPlatform;
  occurred_at: string;
};

export type AnalyticsBatch = {
  events: AnalyticsPayload[];
};

// Market Types
export type SupplierParams = {
  page: number;
  limit: number;
  marketId?: number;
  search?: string;
};

export type MarketParams = {
  page: number;
  limit: number;
  cityId?: number;
  country?: string;
  search?: string;
};

export type SingleMarket = {
  id: number;
  name: string;
  category: string;
  country: string;
  address: string;
  image: string;
};

export type SingleSupplier = {
  id: number;
  clubCode: string;
  name: string;
  image: string;
  profile: string;
  location: string;
  description: string;
  year: string;
  returnRate: number;
  rate: number;
  supplierType: string;
  medal: string;
  marketId: number;
  market: SingleMarket;
};

export type SupplierResponse = {
  suppliers: SingleSupplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type MarketResponse = {
  markets: SingleMarket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type LogisticsFormPayload = {
  images: string[];
  description: string;
  currentAddress: string;
  destination: string;
  phone: string;
  email: string;
  fullName: string;
  shippingMode: "SEA" | "AIR";
  shippingOption: string;
};

// Supplier Verification
type VerificationType = "basic" | "standard" | "physical";

type SupplierInformation = {
  supplierName: string;
  productType: string;
};

type LocationDetails = {
  city: string;
  address: string;
  country: string;
};

type ContactDetails = {
  contactPerson: string;
  phoneNumber: string;
  wechatId?: string;
  email?: string;
};

type SupplierDocuments = {
  quotation?: File | null;
  invoice?: File | null;
};

export type VerifySupplierPayload = SupplierInformation &
  LocationDetails &
  ContactDetails &
  SupplierDocuments & {
    verificationType: VerificationType | "";
    acceptedTerms: boolean;
  };

  export type InspectionRates = {
    tier: InspectionDepth;
    feeKobo: number;
  };

export type VerifySupplierRequest = {
  supplier: {
    name: string;
    productType: string;
    location: {
      city: string;
      address: string;
      country: string;
    };
    contact: {
      person: string;
      phone: string;
      wechat: string;
      email: string;
    };
  };
  pin: string;
  attachments: {
    url: string;
    kind: AttachmentKind;
    note: string;
  }[];
};

// Tracking types
// export type TrackingStatus =
//   | "PLACED"
//   | "CONFIRMED"
//   | "PROCESSING"
//   | "SHIPPED"
//   | "OUT_FOR_DELIVERY"
//   | "DELIVERED"
//   | "CANCELLED";

// export interface TrackingEvent {
//   id: string;
//   status: TrackingStatus;
//   title: string;
//   description?: string | null;
//   location?: string | null;
//   /** Full ISO 8601 string */
//   timestamp: string;
// }

// export interface TrackingItem {
//   id: string;
//   name: string;
//   image?: string | null;
//   quantity: number;
// }

// export interface OrderTrackingResponse {
//   orderNumber: string;
//   status: TrackingStatus;
//   placedAt: string;
//   estimatedDelivery?: string | null;
//   carrier?: string | null;
//   trackingNumber?: string | null;
//   items: TrackingItem[];
//   shippingAddress: {
//     name?: string | null;
//     line: string;
//     city: string;
//     state: string;
//   };
//   events: TrackingEvent[];
// }

// Paste into @/types/types if you prefer to keep types centralized.

export interface TrackingTimelineEntry {
  /** Full ISO 8601 string */
  at: string;
  /** Can be null (e.g. the initial "Order placed" entry) */
  stage: ShipmentStage | null;
  title: string;
  description?: string | null;
  location?: string | null;
}

export interface TrackingItem {
  name: string;
  quantity: number;
  /** Can be an empty string */
  image?: string | null;
}

export interface TrackingPayment {
  /** e.g. "UNPAID" | "PAID" */
  status: string;
  /** Display text, e.g. "Awaiting payment" */
  label: string;
}

// ASSUMED shape: the sample response only had `shipment: null`.
// Adjust these fields to whatever the back end returns once an order ships.
export type ShipmentStage =
  | "BOOKED"
  | "AT_ORIGIN_WAREHOUSE"
  | "LOADED"
  | "DEPARTED_ORIGIN_PORT"
  | "DEPARTED_ORIGIN_AIRPORT"
  | "IN_TRANSIT"
  | "ARRIVED_DEST_PORT"
  | "ARRIVED_DEST_AIRPORT"
  | "CUSTOMS"
  | "CLEARED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "DELAYED"
  | "ON_HOLD"
  | "CUSTOMS_HOLD"
  | "DAMAGED"
  | "LOST"
  | "CANCELLED";

export type ExceptionStage =
  | "DELAYED"
  | "ON_HOLD"
  | "CUSTOMS_HOLD"
  | "DAMAGED"
  | "LOST";

 export interface TrackingShipment {
   mode?: string | null; // "SEA" seen in sample; "AIR" assumed
   carrier?: string | null;
   status?: string | null;
   stage?: ShipmentStage | null;
   stageLabel?: string | null;
   estimatedDelivery?: string | null;
   delayed?: boolean;
   originPort?: string | null;
   destinationPort?: string | null;
   trackingNumber?: string | null;
   containerNumber?: string | null;
   stageUpdatedAt: string;
   shippedAt: string | null;
   deliveredAt: string | null;
   // SEA seen: cbm, voyage, vesselName, billOfLading. AIR keys unknown.
   modeDetails?: Record<string, string | number | null | undefined> | null;
 }

 export interface OrderTrackingResponse {
   reference: string;
   placedAt: string;
   customer: { displayName: string };
   items: TrackingItem[];
   payment: TrackingPayment;
   shipment: TrackingShipment | null;
   timeline: TrackingTimelineEntry[];
   lastUpdatedAt: string;
  // Authenticated responses only
  orderId?: number;
  orderStatus?: string;
  trackingUrl?: string;
  trackingToken?: string;
 }

export interface TrackingApiEnvelope {
  success: boolean;
  data: OrderTrackingResponse;
  message?: string;
}
