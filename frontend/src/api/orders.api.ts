import { apiClient } from "./axios";
import type { OrderResponse } from "./contracts";
import { endpoints } from "./endpoints";

export const orderKeys = {
  mine: ["orders", "mine"] as const,
  adminAll: ["orders", "admin"] as const,
  adminByUser: (userUuid: string) => ["orders", "admin", userUuid] as const,
  detail: (orderUuid: string) => ["orders", orderUuid] as const
};

export async function listMyOrders(): Promise<OrderResponse[]> {
  const response = await apiClient.get<OrderResponse[]>(endpoints.orders.listMine);
  return Array.isArray(response.data) ? response.data : [];
}

export async function listAllOrders(): Promise<OrderResponse[]> {
  const response = await apiClient.get<OrderResponse[]>(endpoints.orders.adminList);
  return Array.isArray(response.data) ? response.data : [];
}

export async function listOrdersByUser(userUuid: string): Promise<OrderResponse[]> {
  const response = await apiClient.get<OrderResponse[]>(endpoints.orders.adminByUser(userUuid));
  return Array.isArray(response.data) ? response.data : [];
}

export async function getOrder(orderUuid: string): Promise<OrderResponse> {
  const response = await apiClient.get<OrderResponse>(endpoints.orders.detail(orderUuid));
  return response.data;
}
