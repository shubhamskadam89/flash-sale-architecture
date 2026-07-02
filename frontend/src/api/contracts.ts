export type Role = "ADMIN" | "USER";

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  userRole?: Role;
};

export type AuthenticatedUser = {
  uuid?: string;
  email?: string;
  fullName?: string;
  role?: Role;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  role: Role;
  fullName: string;
};

export type RegisterResponse = {
  uuid?: string;
  email?: string;
  fullName?: string;
  role?: Role;
} & Record<string, unknown>;

export type ProductResponse = {
  uuid?: string;
  name?: string;
  description?: string;
  basePrice?: number;
  metadata?: Record<string, unknown>;
  isActive?: boolean;
};

export type CreateProductRequest = {
  name: string;
  description?: string;
  basePrice: number;
  metadata?: Record<string, unknown>;
};

export type CreateSaleRequest = {
  name: string;
  startTime: string;
  endTime: string;
};

export type SaleResponse = {
  saleUuid?: string;
  name?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
} & Record<string, unknown>;

export type AddSaleItemRequest = {
  productUuid: string;
  salePrice: number;
  inventory: number;
  maxPerUser: number;
};

export type SaleItemResponse = {
  saleItemUuid?: string;
  saleEventUuid?: string;
  productUuid?: string;
  productName?: string;
  salePrice?: number;
  inventory?: number;
  finalCount?: number;
  maxPerUser?: number;
} & Record<string, unknown>;

export type SaleDetailResponse = SaleResponse & {
  items?: SaleItemResponse[];
};

export type PurchaseRequest = {
  quantity: number;
};

export type PurchaseResponse = {
  orderUuid?: string;
  saleItemUuid?: string;
  productUuid?: string;
  quantity?: number;
  remainingInventory?: number;
  message?: string;
};

export type InventoryResponse = {
  saleItemUuid?: string;
  remainingInventory?: number | null;
  availability?: "AVAILABLE" | "SOLD_OUT" | "NOT_ACTIVE" | "SALE_ENDED" | "INVENTORY_UNAVAILABLE" | string;
  asOf?: string;
  source?: "REDIS" | "DATABASE_INITIAL" | "UNAVAILABLE" | string;
};

export type OrderResponse = {
  orderUuid?: string;
  saleItemUuid?: string;
  productUuid?: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  status?: string;
  createdAt?: string;
} & Record<string, unknown>;
