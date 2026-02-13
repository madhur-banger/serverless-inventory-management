import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, type CreateOrderData, type ListOrdersParams } from '@/services/api';
import { productKeys } from './use-products';
import { toast } from '@/hooks/use-toast';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: ListOrdersParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

export function useOrders(params: ListOrdersParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersApi.list(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderData) => ordersApi.create(data),
    onSuccess: () => {
      // Invalidate both orders and products (stock changed)
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.details() });
      toast({
        title: 'Order placed!',
        description:
          'Your order has been placed successfully. You will receive an email confirmation.',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Order failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}