// Product Types
export interface Product {
    id: string;
    name: string;
    description: string;
    category: ProductCategory;
    price: number; // in cents
    quantity: number;
    sku: string;
    imageUrl?: string;
    lowStock?: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export type ProductCategory =
    | 'electronics'
    | 'clothing'
    | 'home'
    | 'sports'
    | 'books'
    | 'toys'
    | 'food'
    | 'other';
  
  export const PRODUCT_CATEGORIES: ProductCategory[] = [
    'electronics',
    'clothing',
    'home',
    'sports',
    'books',
    'toys',
    'food',
    'other',
  ];
  
  // Order Types
  export interface Order {
    id: string;
    userId: string;
    userEmail: string;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
  }
  
  export type OrderStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';
  
  // API Response Types
  export interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta: {
      requestId: string;
      timestamp: string;
    };
  }
  
  export interface ApiError {
    success: false;
    error: {
      code: string;
      message: string;
      details?: Array<{ field: string; message: string }>;
    };
    meta: {
      requestId: string;
      timestamp: string;
    };
  }
  
  export interface PaginatedResponse<T> {
    items: T[];
    count: number;
    nextToken?: string;
  }
  
  // Auth Types
  export interface User {
    id: string;
    email: string;
  }