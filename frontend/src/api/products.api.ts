import { apiClient } from "./axios";
import type { CreateProductRequest, ProductResponse } from "./contracts";
import { endpoints } from "./endpoints";

export const productKeys = {
  all: ["products"] as const,
  detail: (productUuid: string) => ["products", productUuid] as const
};

export async function listProducts(): Promise<ProductResponse[]> {
  const response = await apiClient.get<ProductResponse[]>(endpoints.products.list);
  return Array.isArray(response.data) ? response.data : [];
}

export async function getProduct(productUuid: string): Promise<ProductResponse> {
  const response = await apiClient.get<ProductResponse>(endpoints.products.detail(productUuid));
  return response.data;
}

export async function createProduct(request: CreateProductRequest): Promise<ProductResponse> {
  const response = await apiClient.post<ProductResponse>(endpoints.products.create, request);
  return response.data;
}
