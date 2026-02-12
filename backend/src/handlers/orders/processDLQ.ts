import { SQSEvent } from 'aws-lambda';
import { notificationService } from '../../services';
import { logger } from '../../utils/logger';


export const handler = async (event: SQSEvent): Promise<void> => {
  logger.setContext({
    handler: 'processDLQ',
    messageCount: event.Records.length,
  });

  logger.warn('Processing DLQ messages - these orders failed notification');

  try {
    await notificationService.processDLQMessages(event);
    
    logger.info('DLQ processing complete', {
      processedCount: event.Records.length,
    });
  } finally {
    logger.clearContext();
  }
};