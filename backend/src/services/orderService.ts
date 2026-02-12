import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import {
  Order,
  OrderItem,
  OrderStatus,
  OrderMessage,
  formatPrice,
} from '../models/order';
import { productRepository, orderRepository } from '../repositories';
import { createOrderSchema, CreateOrderInput } from '../validation/orderSchema';
import { validateInput } from '../validation/helpers';
import { InsufficientStockError } from '../utils/errors';
import { logger } from '../utils/logger';


const sqsClient = new SQSClient({});
const ORDER_QUEUE_URL = process.env.ORDER_QUEUE_URL!;


export const createOrder = async (
  userId: string,
  userEmail: string,
  input: unknown
): Promise<Order> => {
  // 1. Validate input
  const validatedInput = validateInput<CreateOrderInput>(
    createOrderSchema,
    input
  );

  const { productId, quantity } = validatedInput;

  logger.info('Creating order', { userId, productId, quantity });

  // 2. Get product details first
  const product = await productRepository.getProduct(productId);

  // 3. Check stock and decrease atomically
  try {
    await productRepository.decreaseProductQuantity(productId, quantity);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('INSUFFICIENT_STOCK')) {
      const [, available, requested] = error.message.split(':');
      throw new InsufficientStockError(
        productId,
        parseInt(available, 10),
        parseInt(requested, 10)
      );
    }
    throw error;
  }

  // 4. Calculate totals and create order item
  const orderItem: OrderItem = {
    productId: product.id,
    productName: product.name,
    quantity,
    pricePerUnit: product.price,
    totalPrice: product.price * quantity,
  };

  const totalAmount = orderItem.totalPrice;

  // 5. Create order record
  const order = await orderRepository.createOrder(
    userId,
    userEmail,
    [orderItem],
    totalAmount
  );

  // 6. Send message to SQS for async notification processing
  await sendOrderToQueue(order);

  logger.info('Order created successfully', {
    orderId: order.id,
    userId,
    totalAmount: formatPrice(totalAmount),
  });

  return order;
};

/**
 * Send order to SQS queue for notification processing
 */
const sendOrderToQueue = async (order: Order): Promise<void> => {
  const message: OrderMessage = {
    orderId: order.id,
    userId: order.userId,
    userEmail: order.userEmail,
    items: order.items,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
  };

  logger.debug('Sending order to SQS', { orderId: order.id });

  await sqsClient.send(
    new SendMessageCommand({
      QueueUrl: ORDER_QUEUE_URL,
      MessageBody: JSON.stringify(message),
      MessageAttributes: {
        OrderId: {
          DataType: 'String',
          StringValue: order.id,
        },
        UserId: {
          DataType: 'String',
          StringValue: order.userId,
        },
      },
    })
  );

  logger.info('Order sent to SQS', { orderId: order.id });
};



export const getOrder = async (
  orderId: string,
  userId: string
): Promise<Order> => {
  logger.info('Getting order', { orderId, userId });
  return orderRepository.getOrderForUser(orderId, userId);
};



export const listUserOrders = async (
  userId: string,
  params: {
    status?: string;
    limit?: number;
    nextToken?: string;
  } = {}
): Promise<{
  items: Order[];
  count: number;
  nextToken?: string;
}> => {
  logger.info('Listing user orders', { userId, params });

  const status = params.status as OrderStatus | undefined;

  return orderRepository.listUserOrders(userId, {
    status,
    limit: params.limit,
    nextToken: params.nextToken,
  });
};


export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<Order> => {
  logger.info('Updating order status', { orderId, status });
  return orderRepository.updateOrderStatus(orderId, status);
};


export const confirmOrder = async (orderId: string): Promise<Order> => {
  return updateOrderStatus(orderId, OrderStatus.CONFIRMED);
};