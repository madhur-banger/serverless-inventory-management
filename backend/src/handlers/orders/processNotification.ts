import { SQSEvent } from 'aws-lambda';
import { notificationService } from '../../services';
import { logger } from '../../utils/logger';


export const handler = async (
  event: SQSEvent
): Promise<{ batchItemFailures: { itemIdentifier: string }[] }> => {
  logger.setContext({
    handler: 'processNotification',
    messageCount: event.Records.length,
  });

  logger.info('Processing order notifications');

  try {
    const result = await notificationService.processOrderMessages(event);
    
    logger.info('Notification processing complete', {
      total: event.Records.length,
      failed: result.batchItemFailures.length,
    });

    return result;
  } finally {
    logger.clearContext();
  }
};