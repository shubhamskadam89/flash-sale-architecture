import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ordersApi } from '@/api/orders';
import { extractErrorMessage } from '@/api/client';
import type { PurchaseRequest } from '@/types';

export function useOrder(orderUuid: string) {
  return useQuery({
    queryKey: ['orders', orderUuid],
    queryFn: () => ordersApi.getOrder(orderUuid),
    enabled: !!orderUuid,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return failureCount < 6;
      }
      return false;
    },
    retryDelay: 1500,
  });
}

export function usePurchase(saleUuid: string, saleItemUuid: string) {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ data, idempotencyKey }: { data: PurchaseRequest; idempotencyKey: string }) =>
      ordersApi.purchase(saleUuid, saleItemUuid, idempotencyKey, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Purchase confirmed!');
      try {
        const key = 'recent-orders';
        const current = JSON.parse(localStorage.getItem(key) || '[]');
        if (response?.orderUuid && !current.includes(response.orderUuid)) {
          localStorage.setItem(key, JSON.stringify([response.orderUuid, ...current].slice(0, 10)));
        }
      } catch (e) {
        console.error('Failed to save orderUuid to localStorage', e);
      }
      navigate(`/orders/${response.orderUuid}`);
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });
}
