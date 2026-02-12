# CloudFormation Resources

This directory contains modular CloudFormation resources for the Inventory Management System.

## Files

| File | Description |
|------|-------------|
| `dynamodb.yml` | DynamoDB table with GSI |
| `cognito.yml` | Cognito User Pool and Client |
| `sqs.yml` | SQS queues (Order + DLQ) |
| `sns.yml` | SNS topic for notifications |

## DynamoDB Single-Table Design

### Key Structure

| Entity | PK | SK | GSI1PK | GSI1SK |
|--------|----|----|--------|--------|
| Product | `PRODUCT#{id}` | `METADATA` | `CATEGORY#{category}` | `{createdAt}` |
| Order | `ORDER#{id}` | `METADATA` | `USER#{userId}` | `{createdAt}` |

### Access Patterns

1. **Get product by ID**: `PK = PRODUCT#{id}`
2. **List products by category**: `GSI1PK = CATEGORY#{category}`
3. **Get order by ID**: `PK = ORDER#{id}`
4. **List user orders**: `GSI1PK = USER#{userId}`

### Billing

- **Dev**: PAY_PER_REQUEST (no minimum cost)
- **Prod**: PAY_PER_REQUEST (can switch to PROVISIONED for cost optimization)

### Backup

- Point-in-Time Recovery enabled in production
- Server-side encryption always enabled