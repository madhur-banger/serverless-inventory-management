
export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}
  

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    pricePerUnit: number; // in cents
    totalPrice: number; // in cents
  }
  
// Order entity as stored in DynamoDB

  export interface Order {
    id: string;
    userId: string;
    userEmail: string;
    items: OrderItem[];
    totalAmount: number; // in cents
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
}
  

export interface OrderDynamoItem extends Order {
    PK: string; // ORDER#{id}
    SK: string; // METADATA
    GSI1PK: string; // USER#{userId}
    GSI1SK: string; // {createdAt}
}
  

export interface CreateOrderInput {
    productId: string;
    quantity: number;
}
  

export interface OrderMessage {
    orderId: string;
    userId: string;
    userEmail: string;
    items: OrderItem[];
    totalAmount: number;
    createdAt: string;
}
  

export interface OrderNotification {
    type: 'ORDER_CONFIRMATION';
    orderId: string;
    userEmail: string;
    productName: string;
    quantity: number;
    totalAmount: number;
    formattedTotal: string; // e.g., "$49.99"
    orderDate: string;
}
  

export const buildOrderKeys = (
    id: string,
    userId: string,
    createdAt: string
  ) => ({
    PK: `ORDER#${id}`,
    SK: 'METADATA',
    GSI1PK: `USER#${userId}`,
    GSI1SK: createdAt,
});
  

export const formatPrice = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`;
};