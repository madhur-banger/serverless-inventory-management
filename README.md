# Serverless Inventory Management System Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Backend](#backend)
4. [Frontend](#frontend)
5. [Deployment](#deployment)
6. [API Reference](#api-reference)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

### Description
A full-stack serverless inventory management system that allows users to:
- Browse products with search and category filters
- View detailed product information
- Place orders with automatic stock management
- Track order history and status
- Receive email notifications for orders

### Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js 18, Serverless Framework, TypeScript |
| Database | DynamoDB (single-table design) |
| Auth | AWS Cognito |
| Queue | SQS + SNS |
| Hosting | S3 + CloudFront (frontend), API Gateway + Lambda (backend) |
| CI/CD | GitHub Actions |

---

## 🏗️ Architecture

### System Flow
```
User → CloudFront → S3 (React App)
                ↓
User → API Gateway → Cognito Auth → Lambda → DynamoDB
                                      ↓
                              SQS Queue → Lambda → SNS → Email
```

### DynamoDB Single-Table Design

| Entity | PK | SK | GSI1PK | GSI1SK |
|--------|----|----|--------|--------|
| Product | `PRODUCT#{id}` | `METADATA` | `CATEGORY#{category}` | `{createdAt}` |
| Order | `ORDER#{id}` | `METADATA` | `USER#{userId}` | `{createdAt}` |

### Order Processing Flow

1. User places order via `POST /orders`
2. Lambda validates input and checks stock
3. Stock is atomically decreased in DynamoDB
4. Order record created with status `PENDING`
5. Message sent to SQS queue
6. SQS triggers notification Lambda
7. Lambda sends email via SNS
8. Order status updated to `CONFIRMED`
9. If processing fails 3x, message goes to DLQ

---

## 🔧 Backend

### Directory Structure
```
backend/
├── src/
│   ├── handlers/           # Lambda function handlers
│   │   ├── health.ts       # Health check
│   │   ├── docs.ts         # Swagger UI
│   │   ├── products/       # Product CRUD handlers
│   │   └── orders/         # Order handlers + SQS consumers
│   ├── services/           # Business logic layer
│   │   ├── productService.ts
│   │   ├── orderService.ts
│   │   └── notificationService.ts
│   ├── repositories/       # Data access layer
│   │   ├── productRepository.ts
│   │   └── orderRepository.ts
│   ├── middleware/         # Middy middleware
│   │   ├── errorHandler.ts
│   │   ├── requestContext.ts
│   │   └── wrapper.ts
│   ├── models/             # TypeScript interfaces
│   ├── validation/         # Zod schemas
│   └── utils/              # Helpers (logger, errors, response)
├── resources/              # CloudFormation resources
│   ├── dynamodb.yml
│   ├── cognito.yml
│   ├── sqs.yml
│   └── sns.yml
├── docs/
│   └── openapi.yml         # OpenAPI 3.0 spec
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── serverless.yml          # Main Serverless config
```

### Lambda Functions

| Function | Trigger | Description |
|----------|---------|-------------|
| health | GET /health | Health check (no auth) |
| docs | GET /docs | Swagger UI |
| docsSpec | GET /docs/spec | OpenAPI JSON |
| createProduct | POST /products | Create new product |
| getProduct | GET /products/{id} | Get product by ID |
| listProducts | GET /products | List/search products |
| updateProduct | PUT /products/{id} | Update product |
| deleteProduct | DELETE /products/{id} | Delete product |
| createOrder | POST /orders | Place order |
| getOrder | GET /orders/{id} | Get order by ID |
| listOrders | GET /orders | List user's orders |
| processOrderNotification | SQS | Process order notifications |
| processOrderDLQ | SQS DLQ | Handle failed messages |

### Environment Variables

| Variable | Description |
|----------|-------------|
| STAGE | Deployment stage (dev/prod) |
| TABLE_NAME | DynamoDB table name |
| ORDER_QUEUE_URL | SQS queue URL |
| ORDER_TOPIC_ARN | SNS topic ARN |
| LOG_LEVEL | Logging level |
| CORS_ORIGIN | Allowed CORS origin |

---

## 💻 Frontend

### Directory Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/             # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── select.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── toast.tsx
│   │   │   └── toaster.tsx
│   │   └── layout/         # Layout components
│   │       ├── Layout.tsx
│   │       ├── Header.tsx
│   │       └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── Landing.tsx     # Public landing page
│   │   ├── Products.tsx    # Product grid
│   │   ├── ProductDetail.tsx # Product detail + order
│   │   ├── Orders.tsx      # Order history
│   │   └── auth/
│   │       ├── Login.tsx
│   │       └── Signup.tsx
│   ├── context/
│   │   └── AuthContext.tsx # Cognito auth context
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   ├── use-products.ts # React Query hooks
│   │   └── use-orders.ts
│   ├── services/
│   │   └── api.ts          # API client
│   ├── config/
│   │   ├── amplify.ts      # AWS Amplify config
│   │   └── api.ts          # API endpoints
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   ├── lib/
│   │   └── utils.ts        # Utility functions
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── serverless.yml          # S3 + CloudFront config
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

### Pages & Routes

| Route | Page | Auth | Description |
|-------|------|------|-------------|
| `/` | Landing | Public | Hero, features, CTA |
| `/login` | Login | Public | Sign in form |
| `/signup` | Signup | Public | Sign up + confirmation |
| `/products` | Products | Protected | Product grid with filters |
| `/products/:id` | ProductDetail | Protected | Product info + order form |
| `/orders` | Orders | Protected | Order history list |

### Color Palette (Neutral Gray)

| Color | Usage | Value |
|-------|-------|-------|
| Primary | Buttons, links | Gray-900 (#111827) |
| Secondary | Secondary text | Gray-600 (#4B5563) |
| Background | Page background | White / Gray-50 |
| Border | Borders | Gray-200 |
| Success | Success states | Green-600 |
| Warning | Warning states | Yellow-600 |
| Error | Error states | Red-600 |

### Responsive Breakpoints

| Breakpoint | Width | Columns |
|------------|-------|---------|
| Mobile | < 640px | 1 |
| Tablet | 640px - 1024px | 2 |
| Laptop | 1024px - 1280px | 3 |
| Desktop | > 1280px | 4 |

---

## 🚀 Deployment

### Prerequisites

- Node.js 18+
- AWS CLI configured
- Serverless Framework installed globally

### Backend Deployment
```bash
cd backend

# Install dependencies
npm install

# Deploy to dev
npm run deploy:dev

# Deploy to prod
npm run deploy:prod

# Remove stack
npm run remove:dev
```

### Frontend Deployment
```bash
cd frontend

# Install dependencies
npm install

# Build
npm run build

# Deploy to S3 + CloudFront
npm run deploy

# Get your URL from output:
# WebsiteURL: https://d1234567890abc.cloudfront.net
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Update values with your deployment outputs:
```env
VITE_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 📖 API Reference

### Authentication

All endpoints except `/health` and `/docs` require a valid JWT token:
```
Authorization: Bearer <cognito-id-token>
```

### Products

#### List Products
```
GET /products?category=electronics&search=keyboard&limit=20
```

Response:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "count": 20,
    "nextToken": "..."
  }
}
```

#### Get Product
```
GET /products/{id}
```

#### Create Product
```
POST /products
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Description",
  "category": "electronics",
  "price": 4999,
  "quantity": 100,
  "sku": "SKU-001"
}
```

### Orders

#### Create Order
```
POST /orders
Content-Type: application/json

{
  "productId": "uuid",
  "quantity": 2
}
```

#### List Orders
```
GET /orders?status=CONFIRMED&limit=20
```

#### Get Order
```
GET /orders/{id}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "price", "message": "Price must be positive" }
    ]
  },
  "meta": {
    "requestId": "abc123",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- productSchema.test.ts
```

### Test API Manually
```bash
cd backend
chmod +x scripts/test-api.sh

# Edit script with your values
nano scripts/test-api.sh

# Run
./scripts/test-api.sh
```

### Frontend Tests
```bash
cd frontend

# Run in development
npm run dev

# Build and preview
npm run build
npm run preview
```

---

## 🔧 Troubleshooting

### Common Issues

#### CORS Errors
- Check `CORS_ORIGIN` environment variable in backend
- Ensure CloudFront domain is allowed

#### Authentication Errors
- Verify Cognito User Pool ID and Client ID
- Check token expiration
- Ensure user is confirmed

#### Order Processing Fails
- Check SQS queue for messages
- Check DLQ for failed messages
- Review CloudWatch logs for Lambda errors

#### Frontend Not Loading
- Clear browser cache
- Check CloudFront invalidation
- Verify S3 bucket permissions

### Useful AWS CLI Commands
```bash
# Check Cognito users
aws cognito-idp list-users --user-pool-id us-east-1_XXXXXXXXX

# Check SQS messages
aws sqs get-queue-attributes \
  --queue-url https://sqs.us-east-1.amazonaws.com/123/queue \
  --attribute-names ApproximateNumberOfMessages

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id EXXXXXXXXXX \
  --paths "/*"

# View Lambda logs
aws logs tail /aws/lambda/inventory-api-prod-createOrder --follow
```

---

## 📞 Support

For issues or questions:
1. Check the [Swagger documentation](/docs)
2. Review CloudWatch logs
3. Check GitHub Issues

---

*Documentation Version: 1.0.0*
*Last Updated: Project Complete*