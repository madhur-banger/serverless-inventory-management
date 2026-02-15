import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { SQSEvent, SQSRecord } from 'aws-lambda';
import {
  OrderMessage,
  OrderNotification,
  OrderStatus,
  formatPrice,
} from '../models/order';
import { orderRepository } from '../repositories';
import { logger } from '../utils/logger';

// Initialize clients
const snsClient = new SNSClient({});
const sesClient = new SESClient({});

// Environment variables
const ORDER_TOPIC_ARN = process.env.ORDER_TOPIC_ARN!;
const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL || 'noreply@example.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

/**
 * Process order messages from SQS
 */
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

/**
 * Process individual order record
 */
const processOrderRecord = async (record: SQSRecord): Promise<void> => {
  logger.debug('Processing record', { messageId: record.messageId });

  // Parse the order message
  const orderMessage: OrderMessage = JSON.parse(record.body);

  logger.info('Processing order notification', {
    orderId: orderMessage.orderId,
    userEmail: orderMessage.userEmail,
  });

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

  // Send notifications in parallel
  await Promise.all([
    // Send email to USER via SES
    sendUserEmailViaSES(notification),
    // Send alert to ADMIN via SNS (optional)
    sendAdminAlertViaSNS(notification),
  ]);

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
 * Send order confirmation email to USER via Amazon SES
 */
const sendUserEmailViaSES = async (
  notification: OrderNotification
): Promise<void> => {
  const htmlBody = buildHtmlEmail(notification);
  const textBody = buildTextEmail(notification);

  logger.info('Sending user email via SES', {
    orderId: notification.orderId,
    userEmail: notification.userEmail,
    fromEmail: SES_FROM_EMAIL,
  });

  try {
    await sesClient.send(
      new SendEmailCommand({
        Source: SES_FROM_EMAIL,
        Destination: {
          ToAddresses: [notification.userEmail],
        },
        Message: {
          Subject: {
            Data: `Order Confirmation - #${notification.orderId.substring(0, 8).toUpperCase()}`,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: 'UTF-8',
            },
            Text: {
              Data: textBody,
              Charset: 'UTF-8',
            },
          },
        },
      })
    );

    logger.info('User email sent successfully via SES', {
      orderId: notification.orderId,
      userEmail: notification.userEmail,
    });
  } catch (error) {
    logger.error('Failed to send user email via SES', error as Error, {
      orderId: notification.orderId,
      userEmail: notification.userEmail,
    });
    throw error; // Re-throw to trigger retry
  }
};

/**
 * Send admin alert via SNS (for monitoring/admin notifications)
 */
const sendAdminAlertViaSNS = async (
  notification: OrderNotification
): Promise<void> => {
  // Only send if admin email is configured and SNS topic exists
  if (!ADMIN_EMAIL || !ORDER_TOPIC_ARN) {
    logger.debug('Skipping admin SNS notification - not configured');
    return;
  }

  const adminMessage = buildAdminAlertMessage(notification);

  logger.debug('Sending admin alert via SNS', {
    orderId: notification.orderId,
    topicArn: ORDER_TOPIC_ARN,
  });

  try {
    await snsClient.send(
      new PublishCommand({
        TopicArn: ORDER_TOPIC_ARN,
        Subject: `[ORDER] New Order #${notification.orderId.substring(0, 8).toUpperCase()} - ${notification.formattedTotal}`,
        Message: adminMessage,
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

    logger.info('Admin SNS notification sent', { orderId: notification.orderId });
  } catch (error) {
    // Log but don't fail - admin notification is not critical
    logger.warn('Failed to send admin SNS notification', {
      orderId: notification.orderId,
      error: (error as Error).message,
    });
  }
};

/**
 * Build HTML email for user
 */
const buildHtmlEmail = (notification: OrderNotification): string => {
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
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #111827; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                📦 Order Confirmed!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Thank you for your order! We're getting it ready for you.
              </p>
              
              <!-- Order Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                      Order ID
                    </p>
                    <p style="margin: 0 0 20px; color: #111827; font-size: 18px; font-weight: 600; font-family: monospace;">
                      #${notification.orderId.substring(0, 8).toUpperCase()}
                    </p>
                    
                    <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                      Order Date
                    </p>
                    <p style="margin: 0; color: #111827; font-size: 14px;">
                      ${orderDate}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Item Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e5e7eb; margin-top: 20px;">
                <tr>
                  <td style="padding: 20px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #374151; font-size: 16px; padding: 10px 0;">
                          <strong>${notification.productName}</strong>
                          <br>
                          <span style="color: #6b7280; font-size: 14px;">Quantity: ${notification.quantity}</span>
                        </td>
                        <td align="right" style="color: #111827; font-size: 16px; font-weight: 600;">
                          ${notification.formattedTotal}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 2px solid #111827; margin-top: 10px;">
                <tr>
                  <td style="padding: 20px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #111827; font-size: 18px; font-weight: 600;">
                          Total
                        </td>
                        <td align="right" style="color: #111827; font-size: 24px; font-weight: 700;">
                          ${notification.formattedTotal}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Questions about your order?
              </p>
              <p style="margin: 0; color: #374151; font-size: 14px;">
                Contact us at support@example.com
              </p>
              <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px;">
                Serverless Inventory Management System
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
};

/**
 * Build plain text email for user
 */
const buildTextEmail = (notification: OrderNotification): string => {
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
ORDER CONFIRMATION
==================

Thank you for your purchase!

ORDER DETAILS
─────────────────────────────────────────
Order ID:     #${notification.orderId.substring(0, 8).toUpperCase()}
Date:         ${orderDate}

ITEMS
─────────────────────────────────────────
${notification.productName}
  Quantity:   ${notification.quantity}

TOTAL:        ${notification.formattedTotal}

─────────────────────────────────────────

Your order has been confirmed and is being processed.

Questions? Contact us at support@example.com

Serverless Inventory Management System
`.trim();
};

/**
 * Build admin alert message for SNS
 */
const buildAdminAlertMessage = (notification: OrderNotification): string => {
  return `
NEW ORDER RECEIVED
==================

Order ID:     ${notification.orderId}
Customer:     ${notification.userEmail}
Product:      ${notification.productName}
Quantity:     ${notification.quantity}
Total:        ${notification.formattedTotal}
Date:         ${notification.orderDate}

─────────────────────────────────────────
This is an automated admin notification.
`.trim();
};

/**
 * Process DLQ messages (failed notifications)
 */
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

      // TODO: Could add alerting here (e.g., send to Slack, PagerDuty, etc.)

    } catch (error) {
      logger.error('Failed to process DLQ message', error as Error, {
        messageId: record.messageId,
      });
    }
  }
};