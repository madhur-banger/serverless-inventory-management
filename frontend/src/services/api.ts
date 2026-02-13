import { API_ENDPOINTS } from '@/config/api';
import type {
  Product,
  Order,
  ApiResponse,
  PaginatedResponse,
  ProductCategory,
} from '@/types';

// Get auth token function - will be set by App
let getTokenFn: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(fn: () => Promise<string | null>) {
  getTokenFn = fn;
}

async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getTokenFn ? await getTokenFn() : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { message: 'An error occurred' },
    }));
    throw new Error(error.error?.message || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// =============================================================================
// PRODUCTS API
// =============================================================================

export interface ListProductsParams {
  category?: ProductCategory;
  search?: string;
  limit?: number;
  nextToken?: string;
}

export const productsApi = {
  list: async (
    params: ListProductsParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Product>>> => {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.set('category', params.category);
    if (params.search) searchParams.set('search', params.search);
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.nextToken) searchParams.set('nextToken', params.nextToken);

    const url = `${API_ENDPOINTS.products}${searchParams.toString() ? `?${searchParams}` : ''}`;
    return fetchWithAuth<ApiResponse<PaginatedResponse<Product>>>(url);
  },

  get: async (id: string): Promise<ApiResponse<Product>> => {
    return fetchWithAuth<ApiResponse<Product>>(API_ENDPOINTS.product(id));
  },
};

// =============================================================================
// ORDERS API
// =============================================================================

export interface CreateOrderData {
  productId: string;
  quantity: number;
}

export interface ListOrdersParams {
  status?: string;
  limit?: number;
  nextToken?: string;
}

export const ordersApi = {
  list: async (
    params: ListOrdersParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Order>>> => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set('status', params.status);
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.nextToken) searchParams.set('nextToken', params.nextToken);

    const url = `${API_ENDPOINTS.orders}${searchParams.toString() ? `?${searchParams}` : ''}`;
    return fetchWithAuth<ApiResponse<PaginatedResponse<Order>>>(url);
  },

  get: async (id: string): Promise<ApiResponse<Order>> => {
    return fetchWithAuth<ApiResponse<Order>>(API_ENDPOINTS.order(id));
  },

  create: async (data: CreateOrderData): Promise<ApiResponse<Order>> => {
    return fetchWithAuth<ApiResponse<Order>>(API_ENDPOINTS.orders, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// =============================================================================
// HEALTH API
// =============================================================================

export const healthApi = {
  check: async (): Promise<{ status: string }> => {
    const response = await fetch(API_ENDPOINTS.health);
    return response.json();
  },
};