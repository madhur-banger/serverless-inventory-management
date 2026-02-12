import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SQSEvent, SQSRecord } from 'aws-lambda';
import {
  OrderMessage,
  OrderNotification,
  OrderStatus,
  formatPrice,
} from '../models/order';
import { orderRepository } from '../repositories';
import { logger } from '../utils/logger';


const snsClient = new SNSClient({});
const ORDER_TOPIC_ARN = process.env.ORDER_TOPIC_ARN!;


export const processOrderMessages = async (
  event: SQSEvent
): Promise<{ batchItemFailures: { itemIdentifier: string }[] }> => {
  const batchItemFailures: { itemIdentifier: string }[] = [];

  logger.info('Processing order messages', { count: event.Records.length });

  for (const record of event.Records) {
    try {
      await processOrderRecord(record);
    } catch (error) {
      logger.error(
        'Failed to process order message',
        error as Error,
        { messageId: record.messageId }
      );
      // Add to failures for retry
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  logger.info('Batch processing complete', {
    total: event.Records.length,
    failed: batchItemFailures.length,
  });

  return { batchItemFailures };
};

const processOrderRecord = async (record: SQSRecord): Promise<void> => {
  logger.debug('Processing record', { messageId: record.messageId });

  // Parse the order message
  const orderMessage: OrderMessage = JSON.parse(record.body);

  logger.info('Processing order notification', {
    orderId: orderMessage.orderId,
    userEmail: orderMessage.userEmail,
  });

  // Send SNS notification
  await sendOrderNotification(orderMessage);

  // Update order status to CONFIRMED
  await orderRepository.updateOrderStatus(
    orderMessage.orderId,
    OrderStatus.CONFIRMED
  );

  logger.info('Order processed successfully', {
    orderId: orderMessage.orderId,
  });
};

/**
 * Send order confirmation notification via SNS
 */
const sendOrderNotification = async (
  orderMessage: OrderMessage
): Promise<void> => {
  // Build notification payload
  const notification: OrderNotification = {
    type: 'ORDER_CONFIRMATION',
    orderId: orderMessage.orderId,
    userEmail: orderMessage.userEmail,
    productName: orderMessage.items[0]?.productName || 'Product',
    quantity: orderMessage.items[0]?.quantity || 1,
    totalAmount: orderMessage.totalAmount,
    formattedTotal: formatPrice(orderMessage.totalAmount),
    orderDate: orderMessage.createdAt,
  };

  // Build email-friendly message
  const emailMessage = buildEmailMessage(notification);

  logger.debug('Sending SNS notification', {
    orderId: notification.orderId,
    topicArn: ORDER_TOPIC_ARN,
  });

  await snsClient.send(
    new PublishCommand({
      TopicArn: ORDER_TOPIC_ARN,
      Subject: `Order Confirmation - ${notification.orderId.substring(0, 8)}`,
      Message: emailMessage,
      MessageAttributes: {
        orderType: {
          DataType: 'String',
          StringValue: notification.type,
        },
        orderId: {
          DataType: 'String',
          StringValue: notification.orderId,
        },
        userEmail: {
          DataType: 'String',
          StringValue: notification.userEmail,
        },
      },
    })
  );

  logger.info('SNS notification sent', { orderId: notification.orderId });
};



const buildEmailMessage = (notification: OrderNotification): string => {
  const orderDate = new Date(notification.orderDate).toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ORDER CONFIRMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for your purchase!

ORDER DETAILS
─────────────────────────────────────────
Order ID:     ${notification.orderId}
Date:         ${orderDate}

ITEMS
─────────────────────────────────────────
${notification.productName}
  Quantity:   ${notification.quantity}
  
TOTAL:        ${notification.formattedTotal}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your order has been confirmed and is being processed.

If you have any questions, please contact support.

Thank you for shopping with us!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Serverless Inventory Management System (sls.guru)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
};


export const processDLQMessages = async (
  event: SQSEvent
): Promise<void> => {
  logger.warn('Processing DLQ messages', { count: event.Records.length });

  for (const record of event.Records) {
    try {
      const orderMessage: OrderMessage = JSON.parse(record.body);

      logger.error('Order notification failed permanently', undefined, {
        orderId: orderMessage.orderId,
        userEmail: orderMessage.userEmail,
        messageId: record.messageId,
        approximateReceiveCount: record.attributes.ApproximateReceiveCount,
      });

    } catch (error) {
      logger.error('Failed to process DLQ message', error as Error, {
        messageId: record.messageId,
      });
    }
  }
};