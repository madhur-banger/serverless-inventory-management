import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SNSClient } from '@aws-sdk/client-sns';


export const dynamoMock = mockClient(DynamoDBDocumentClient);
export const sqsMock = mockClient(SQSClient);
export const snsMock = mockClient(SNSClient);


export const resetAllMocks = () => {
  dynamoMock.reset();
  sqsMock.reset();
  snsMock.reset();
};