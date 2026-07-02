import { apiClient } from "./axios";
import type {
  AddSaleItemRequest,
  CreateSaleRequest,
  InventoryResponse,
  PurchaseRequest,
  PurchaseResponse,
  SaleDetailResponse,
  SaleItemResponse,
  SaleResponse
} from "./contracts";
import { endpoints } from "./endpoints";

export const saleKeys = {
  adminList: ["admin-sales"] as const,
  available: ["sales"] as const,
  detail: (saleUuid: string) => ["sales", saleUuid] as const,
  inventory: (saleItemUuid: string) => ["sale-item-inventory", saleItemUuid] as const
};

export async function listAdminSales(): Promise<SaleDetailResponse[]> {
  const response = await apiClient.get<SaleDetailResponse[]>(endpoints.sales.adminList);
  return Array.isArray(response.data) ? response.data : [];
}

export async function listAvailableSales(): Promise<SaleDetailResponse[]> {
  const response = await apiClient.get<SaleDetailResponse[]>(endpoints.sales.list);
  return Array.isArray(response.data) ? response.data : [];
}

export async function createSale(request: CreateSaleRequest): Promise<SaleResponse> {
  const response = await apiClient.post<SaleResponse>(endpoints.sales.create, request);
  return response.data;
}

export async function addSaleItem(
  saleUuid: string,
  request: AddSaleItemRequest
): Promise<SaleItemResponse> {
  const response = await apiClient.post<SaleItemResponse>(endpoints.sales.addItem(saleUuid), request);
  return response.data;
}

export async function activateSale(saleUuid: string): Promise<SaleResponse> {
  const response = await apiClient.post<SaleResponse>(endpoints.sales.activate(saleUuid));
  return response.data;
}

export async function purchaseSaleItem(
  saleUuid: string,
  saleItemUuid: string,
  request: PurchaseRequest,
  idempotencyKey: string
): Promise<PurchaseResponse> {
  const response = await apiClient.post<PurchaseResponse>(
    endpoints.sales.purchase(saleUuid, saleItemUuid),
    request,
    { headers: { "X-Idempotency-Key": idempotencyKey } }
  );
  return response.data;
}

export async function getSaleItemInventory(saleItemUuid: string): Promise<InventoryResponse> {
  const response = await apiClient.get<InventoryResponse>(endpoints.inventory.saleItem(saleItemUuid));
  return response.data;
}
