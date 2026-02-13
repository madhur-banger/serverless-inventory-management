# Serverless Inventory Management System
## Technical Documentation

**Author:** Madhur  
**Deployment:** Production  
**Version:** 1.0.0  
**Date:** February 2026

---

## 📋 Executive Summary

A production-grade, full-stack serverless inventory management system built on AWS, demonstrating enterprise-level architecture, event-driven design, and modern DevOps practices. The system handles product inventory, order processing, and automated notifications with real-time stock management and asynchronous order fulfillment.

**Live Deployment:**
- **Frontend:** https://d3g8yrgnuos3zh.cloudfront.net
- **API Base URL:** https://s26yt7k27l.execute-api.us-east-1.amazonaws.com/prod
- **API Documentation:** https://s26yt7k27l.execute-api.us-east-1.amazonaws.com/prod/docs

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Client Layer                                       │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │  React SPA (TypeScript + Vite)                                  │         │
│  │  - Product Browsing & Search                                    │         │
│  │  - Order Management                                             │         │
│  │  - User Authentication (Cognito)                                │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                              │                                               │
│                              │ HTTPS                                         │
│                              ▼                                               │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │  Amazon CloudFront CDN                                          │         │
│  │  - Global Edge Locations                                        │         │
│  │  - SSL/TLS Termination                                          │         │
│  │  - Static Asset Caching                                         │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                              │                                               │
│                              ▼                                               │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │  Amazon S3 (Static Hosting)                                     │         │
│  └────────────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
                               │ REST API Calls
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API Gateway Layer                                    │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │  Amazon API Gateway (REST API)                                  │         │
│  │  - Request Validation                                           │         │
│  │  - Cognito Authorizer (JWT)                                     │         │
│  │  - Rate Limiting & Throttling                                   │         │
│  │  - CORS Configuration                                           │         │
│  └────────────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Compute Layer (Lambda)                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │  Product API     │  │   Order API      │  │  Notification    │          │
│  │  - Create        │  │   - Create       │  │  Processor       │          │
│  │  - Read          │  │   - Read         │  │  (SQS Consumer)  │          │
│  │  - Update        │  │   - List         │  │                  │          │
│  │  - Delete        │  │   - History      │  │                  │          │
│  │  - List/Search   │  │                  │  │                  │          │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘          │
│           │                     │                      │                     │
│           └─────────────────────┼──────────────────────┘                     │
│                                 ▼                                            │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │  Middleware Layer (Middy)                                       │         │
│  │  - Error Handling                                               │         │
│  │  - Request Context & Logging                                    │         │
│  │  - CORS Headers                                                 │         │
│  │  - JSON Body Parsing                                            │         │
│  └────────────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Data & Messaging Layer                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │   DynamoDB       │  │   Amazon SQS     │  │   Amazon SNS     │          │
│  │                  │  │                  │  │                  │          │
│  │  Single-Table    │  │  Order Queue     │  │  Email Topic     │          │
│  │  Design:         │  │  + Dead Letter   │  │                  │          │
│  │  - Products      │  │    Queue (DLQ)   │  │  Subscriptions:  │          │
│  │  - Orders        │  │                  │  │  - Admin Email   │          │
│  │                  │  │  Features:       │  │                  │          │
│  │  GSI:            │  │  - 3 Retries     │  │                  │          │
│  │  - Category      │  │  - 4 Day TTL     │  │                  │          │
│  │  - User Orders   │  │  - Long Polling  │  │                  │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Authentication & Security                              │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │  Amazon Cognito User Pool                                       │         │
│  │  - User Registration & Verification                             │         │
│  │  - JWT Token Generation                                         │         │
│  │  - Password Policy Enforcement                                  │         │
│  │  - Multi-factor Authentication Ready                            │         │
│  └────────────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Monitoring & Observability                                │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │  Amazon CloudWatch                                              │         │
│  │  - Lambda Logs & Metrics                                        │         │
│  │  - DynamoDB Metrics                                             │         │
│  │  - SQS Queue Depth Monitoring                                   │         │
│  │  - API Gateway Request Metrics                                  │         │
│  │  - Custom Application Logs (Structured JSON)                    │         │
│  └────────────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Event-Driven Order Processing Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Order Processing Pipeline                             │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: Order Creation (Synchronous)
─────────────────────────────────
Client
  │
  │ POST /orders
  │ { productId, quantity }
  ▼
API Gateway + Cognito Auth
  │
  │ JWT Validated
  │ Extract: userId, email
  ▼
Create Order Lambda
  │
  ├─► Validate Input (Zod Schema)
  │   └─► Validation Error? → Return 400
  │
  ├─► Check Product Stock (DynamoDB)
  │   └─► Product Not Found? → Return 404
  │   └─► Insufficient Stock? → Return 409
  │
  ├─► Atomic Stock Decrease
  │   │   DynamoDB UpdateItem with Condition:
  │   │   SET quantity = quantity - :qty
  │   │   WHERE quantity >= :qty
  │   └─► Condition Failed? → Return 409
  │
  ├─► Create Order Record
  │   │   Status: PENDING
  │   │   Timestamp: ISO-8601
  │   └─► Store in DynamoDB
  │
  ├─► Send to SQS Queue
  │   │   Message Body: Order details
  │   │   Attributes: OrderId, UserId
  │   └─► Queue confirmed
  │
  └─► Return 201 Created
      Response: { orderId, status, product, ... }


Step 2: Notification Processing (Asynchronous)
───────────────────────────────────────────────

SQS Order Queue
  │
  │ Trigger (Event Source Mapping)
  │ Batch Size: 10
  │ Visibility Timeout: 180s
  ▼
Process Notification Lambda
  │
  │ For Each Message in Batch:
  │
  ├─► Parse Order Data
  │
  ├─► Build Email Content
  │   │   Subject: Order Confirmation
  │   │   Body: Formatted HTML/Text
  │   └─► Include: OrderId, Product, Quantity, Total
  │
  ├─► Publish to SNS Topic
  │   │   Topic: OrderNotifications
  │   │   Attributes: OrderId, UserId
  │   └─► SNS distributes to subscribers
  │
  ├─► Update Order Status
  │   │   DynamoDB UpdateItem:
  │   │   SET status = 'CONFIRMED'
  │   │   SET updatedAt = :timestamp
  │   └─► Success
  │
  └─► Delete from Queue
      └─► Message processed successfully


Step 3: Retry & Dead Letter Queue
──────────────────────────────────

On Processing Failure:
  │
  ├─► Attempt 1 Fails
  │   └─► Message returns to queue after 180s
  │
  ├─► Attempt 2 Fails
  │   └─► Message returns to queue after 180s
  │
  ├─► Attempt 3 Fails
  │   └─► Max Receive Count (3) reached
  │
  └─► Move to Dead Letter Queue
      │
      │ Trigger: DLQ Lambda
      ▼
      Process DLQ Lambda
      │
      ├─► Log Error Details
      │   └─► CloudWatch Logs
      │
      ├─► Send Alert
      │   └─► SNS Topic (Admin)
      │
      └─► Archive for Manual Review
```

---

## 🔧 Technical Stack

### Backend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | 18.x | Lambda execution environment |
| **Language** | TypeScript | 5.3+ | Type-safe development |
| **Framework** | Serverless Framework | 3.x | Infrastructure as Code |
| **API** | AWS Lambda + API Gateway | - | Serverless compute & API management |
| **Database** | Amazon DynamoDB | - | NoSQL database with single-table design |
| **Queue** | Amazon SQS | - | Asynchronous message processing |
| **Notifications** | Amazon SNS | - | Email delivery system |
| **Authentication** | Amazon Cognito | - | User management & JWT tokens |
| **Validation** | Zod | 3.x | Runtime schema validation |
| **Middleware** | Middy | 5.x | Lambda middleware framework |
| **Testing** | Jest | 29.x | Unit & integration testing |
| **Linting** | ESLint + Prettier | - | Code quality & formatting |

### Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React | 18.x | UI library |
| **Language** | TypeScript | 5.x | Type safety |
| **Build Tool** | Vite | 5.x | Fast bundling & dev server |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS |
| **State Management** | React Query (TanStack) | 5.x | Server state management |
| **Routing** | React Router | 6.x | Client-side routing |
| **Authentication** | AWS Amplify | 6.x | Cognito integration |
| **HTTP Client** | Axios | 1.x | API requests |
| **Forms** | React Hook Form | 7.x | Form handling |
| **UI Components** | Custom + shadcn/ui patterns | - | Reusable components |

### AWS Services Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          AWS Service Stack                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Compute:                                                                │
│  ├─ AWS Lambda (13 functions)                                           │
│  │  ├─ Runtime: Node.js 18.x                                            │
│  │  ├─ Memory: 512 MB (configurable)                                    │
│  │  └─ Timeout: 30s (API), 180s (SQS processors)                        │
│                                                                          │
│  API & Routing:                                                          │
│  ├─ Amazon API Gateway (REST API)                                       │
│  │  ├─ Regional Endpoint                                                │
│  │  ├─ Custom Domain: (Optional)                                        │
│  │  └─ Stage: prod                                                      │
│                                                                          │
│  Storage:                                                                │
│  ├─ Amazon DynamoDB                                                      │
│  │  ├─ Table: inventory-api-prod                                        │
│  │  ├─ Billing Mode: PAY_PER_REQUEST                                    │
│  │  ├─ Encryption: AWS Managed                                          │
│  │  ├─ Point-in-Time Recovery: Enabled                                  │
│  │  └─ Global Secondary Index: GSI1 (Category & User queries)           │
│  │                                                                       │
│  ├─ Amazon S3                                                            │
│  │  ├─ Frontend Hosting                                                 │
│  │  └─ Static Website Configuration                                     │
│                                                                          │
│  Messaging:                                                              │
│  ├─ Amazon SQS                                                           │
│  │  ├─ Order Queue                                                       │
│  │  │  ├─ Message Retention: 4 days                                     │
│  │  │  ├─ Visibility Timeout: 180s                                      │
│  │  │  └─ Dead Letter Queue: Enabled (maxReceiveCount: 3)              │
│  │  │                                                                    │
│  │  └─ Dead Letter Queue                                                │
│  │     ├─ Message Retention: 14 days                                    │
│  │     └─ Visibility Timeout: 60s                                       │
│  │                                                                       │
│  ├─ Amazon SNS                                                           │
│  │  └─ Order Notifications Topic                                        │
│  │     └─ Email Subscription                                            │
│                                                                          │
│  Authentication:                                                         │
│  ├─ Amazon Cognito User Pool                                            │
│  │  ├─ Username: Email                                                  │
│  │  ├─ Auto-verify: Email                                               │
│  │  ├─ Password Policy: 8 chars, upper, lower, numbers                 │
│  │  ├─ Token Validity: 1 hour (access), 30 days (refresh)              │
│  │  └─ App Client: No secret (SPA)                                      │
│                                                                          │
│  Content Delivery:                                                       │
│  ├─ Amazon CloudFront                                                    │
│  │  ├─ Distribution: d3g8yrgnuos3zh.cloudfront.net                      │
│  │  ├─ Origin: S3 bucket                                                │
│  │  ├─ SSL Certificate: Default CloudFront                              │
│  │  ├─ Price Class: All Edge Locations                                  │
│  │  └─ Default Root Object: index.html                                  │
│                                                                          │
│  Monitoring:                                                             │
│  ├─ Amazon CloudWatch                                                    │
│  │  ├─ Lambda Logs                                                       │
│  │  ├─ API Gateway Logs                                                 │
│  │  ├─ DynamoDB Metrics                                                 │
│  │  └─ SQS Queue Metrics                                                │
│                                                                          │
│  Security:                                                               │
│  ├─ AWS IAM                                                              │
│  │  ├─ Lambda Execution Roles (per function)                            │
│  │  └─ Least Privilege Principle                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Design

### DynamoDB Single-Table Design

**Table Name:** `inventory-api-prod`

**Partition Key (PK):** String  
**Sort Key (SK):** String  
**Global Secondary Index (GSI1):**
- **GSI1PK:** String
- **GSI1SK:** String

### Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Entity Access Patterns                                │
└─────────────────────────────────────────────────────────────────────────────┘

Products Table Structure:
┌──────────────────────┬──────────┬───────────────────────┬─────────────────┐
│ PK                   │ SK       │ GSI1PK                │ GSI1SK          │
├──────────────────────┼──────────┼───────────────────────┼─────────────────┤
│ PRODUCT#<uuid>       │ METADATA │ CATEGORY#electronics  │ 2024-01-15T...  │
│ PRODUCT#<uuid>       │ METADATA │ CATEGORY#clothing     │ 2024-01-14T...  │
│ PRODUCT#<uuid>       │ METADATA │ CATEGORY#electronics  │ 2024-01-13T...  │
└──────────────────────┴──────────┴───────────────────────┴─────────────────┘

Orders Table Structure:
┌──────────────────────┬──────────┬───────────────────────┬─────────────────┐
│ PK                   │ SK       │ GSI1PK                │ GSI1SK          │
├──────────────────────┼──────────┼───────────────────────┼─────────────────┤
│ ORDER#<uuid>         │ METADATA │ USER#<cognito-sub>    │ 2024-01-15T...  │
│ ORDER#<uuid>         │ METADATA │ USER#<cognito-sub>    │ 2024-01-14T...  │
│ ORDER#<uuid>         │ METADATA │ USER#<cognito-sub>    │ 2024-01-13T...  │
└──────────────────────┴──────────┴───────────────────────┴─────────────────┘


Access Patterns & Queries:
═══════════════════════════

1. Get Product by ID
   Operation: GetItem
   Key: PK = PRODUCT#<id>, SK = METADATA
   Use Case: Product detail page
   
2. List All Products
   Operation: Scan (with filters)
   Use Case: Product catalog browsing
   
3. List Products by Category
   Operation: Query GSI1
   Key: GSI1PK = CATEGORY#<category>
   Sort: GSI1SK (createdAt, descending)
   Use Case: Category filtering
   
4. Search Products by Name
   Operation: Scan with FilterExpression
   Filter: contains(name, :searchTerm)
   Use Case: Product search
   
5. Get Order by ID
   Operation: GetItem
   Key: PK = ORDER#<id>, SK = METADATA
   Use Case: Order details
   
6. List User's Orders
   Operation: Query GSI1
   Key: GSI1PK = USER#<userId>
   Sort: GSI1SK (createdAt, descending)
   Use Case: Order history
   
7. Atomic Stock Decrease
   Operation: UpdateItem with ConditionExpression
   Condition: quantity >= :requestedQuantity
   Use Case: Prevent overselling
```

### Data Models

#### Product Entity

```typescript
interface Product {
  // Primary Keys
  PK: string;                    // PRODUCT#<uuid>
  SK: string;                    // METADATA
  
  // GSI Keys
  GSI1PK: string;                // CATEGORY#<category>
  GSI1SK: string;                // <createdAt ISO timestamp>
  
  // Entity Type
  entityType: 'PRODUCT';
  
  // Product Data
  id: string;                    // UUID v4
  name: string;                  // Product name
  description: string;           // Product description
  category: string;              // electronics | clothing | food | other
  price: number;                 // Price in cents (e.g., 4999 = $49.99)
  quantity: number;              // Available stock quantity
  sku: string;                   // Stock Keeping Unit (unique)
  imageUrl?: string;             // Optional product image URL
  
  // Metadata
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  createdBy: string;             // User ID (Cognito sub)
  
  // Computed Fields (not stored)
  isLowStock?: boolean;          // quantity < 10
}
```

#### Order Entity

```typescript
interface Order {
  // Primary Keys
  PK: string;                    // ORDER#<uuid>
  SK: string;                    // METADATA
  
  // GSI Keys
  GSI1PK: string;                // USER#<userId>
  GSI1SK: string;                // <createdAt ISO timestamp>
  
  // Entity Type
  entityType: 'ORDER';
  
  // Order Data
  id: string;                    // UUID v4
  userId: string;                // Cognito user sub
  userEmail: string;             // User's email
  productId: string;             // Reference to product
  productName: string;           // Denormalized for email
  quantity: number;              // Ordered quantity
  pricePerUnit: number;          // Price at time of order (cents)
  totalAmount: number;           // quantity * pricePerUnit
  status: OrderStatus;           // PENDING | CONFIRMED | CANCELLED
  
  // Metadata
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}

enum OrderStatus {
  PENDING = 'PENDING',           // Order created, awaiting notification
  CONFIRMED = 'CONFIRMED',       // Notification sent successfully
  CANCELLED = 'CANCELLED'        // Order cancelled (future feature)
}
```

### DynamoDB Configuration

```yaml
BillingMode: PAY_PER_REQUEST      # On-demand pricing (no capacity planning)
PointInTimeRecoveryEnabled: true  # Continuous backups
SSESpecification:                 # Encryption at rest
  SSEEnabled: true
  SSEType: KMS                    # AWS managed keys
StreamSpecification:
  StreamViewType: NEW_AND_OLD_IMAGES  # For future event sourcing

GlobalSecondaryIndexes:
  - IndexName: GSI1
    KeySchema:
      - AttributeName: GSI1PK
        KeyType: HASH
      - AttributeName: GSI1SK
        KeyType: RANGE
    Projection:
      ProjectionType: ALL         # Include all attributes
```

---

## 🔌 API Documentation

### Base URL
```
Production: https://s26yt7k27l.execute-api.us-east-1.amazonaws.com/prod
```

### Authentication

All endpoints except `/health`, `/docs`, and `/docs/spec` require authentication.

**Authentication Header:**
```
Authorization: Bearer <JWT_ID_TOKEN>
```

**Token Source:** Amazon Cognito User Pool  
**Token Type:** ID Token (not Access Token)  
**Token Validity:** 1 hour  
**Refresh:** Use Refresh Token to obtain new ID Token

**JWT Payload Example:**
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "email_verified": true,
  "token_use": "id",
  "auth_time": 1705312345,
  "exp": 1705315945,
  "iat": 1705312345
}
```

### API Endpoints

#### 1. Health Check

**Endpoint:** `GET /health`  
**Authentication:** Not required  
**Description:** Service health check

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "inventory-api",
    "version": "1.0.0",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "meta": {
    "requestId": "abc123",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### 2. API Documentation

**Endpoint:** `GET /docs`  
**Authentication:** Not required  
**Description:** Swagger UI interface

**Endpoint:** `GET /docs/spec`  
**Authentication:** Not required  
**Description:** OpenAPI 3.0 specification (JSON)

---

#### 3. Create Product

**Endpoint:** `POST /products`  
**Authentication:** Required  
**Description:** Create a new product

**Request Body:**
```json
{
  "name": "Wireless Keyboard",
  "description": "Bluetooth mechanical keyboard with RGB",
  "category": "electronics",
  "price": 7999,
  "quantity": 50,
  "sku": "KB-MECH-001",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Validation Rules:**
- `name`: 3-200 characters
- `description`: 10-2000 characters
- `category`: electronics | clothing | food | other
- `price`: Positive integer (cents)
- `quantity`: Non-negative integer
- `sku`: 3-50 characters, unique
- `imageUrl`: Optional, valid URL

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Wireless Keyboard",
    "description": "Bluetooth mechanical keyboard with RGB",
    "category": "electronics",
    "price": 7999,
    "quantity": 50,
    "sku": "KB-MECH-001",
    "imageUrl": "https://example.com/image.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "createdBy": "user-cognito-sub",
    "isLowStock": false
  },
  "meta": {
    "requestId": "abc123",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

*Validation Error (400):*
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "price",
        "message": "Price must be a positive number"
      }
    ]
  },
  "meta": {
    "requestId": "abc123",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

*Unauthorized (401):*
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authentication token"
  },
  "meta": {
    "requestId": "abc123",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### 4. Get Product

**Endpoint:** `GET /products/{id}`  
**Authentication:** Required  
**Description:** Retrieve a single product by ID

**Path Parameters:**
- `id`: Product UUID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Wireless Keyboard",
    "description": "Bluetooth mechanical keyboard with RGB",
    "category": "electronics",
    "price": 7999,
    "quantity": 50,
    "sku": "KB-MECH-001",
    "imageUrl": "https://example.com/image.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "createdBy": "user-cognito-sub",
    "isLowStock": false
  },
  "meta": {
    "requestId": "abc123",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found"
  },
  "meta": {
    "requestId": "abc123",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### 5. List Products

**Endpoint:** `GET /products`  
**Authentication:** Required  
**Description:** List products with optional filtering and pagination

**Query Parameters:**
- `category` (optional): Filter by category (electronics | clothing | food | other)
- `search` (optional): Search in product name (case-insensitive, contains match)
- `limit` (optional): Number of items per page (default: 20, max: 100)
- `nextToken` (optional): Pagination token from previous response

**Example Requests:**
```
GET /products
GET /products?category=electronics
GET /products?search=keyboard
GET /products?category=electronics&limit=10
GET /products?nextToken=eyJQSyI6IlBST0R...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Wireless Keyboard",
        "category": "electronics",
        "price": 7999,
        "quantity": 50,
        "isLowStock": false,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "count": 1,
    "nextToken": "eyJQSyI6IlBST0RVQ1Qi..."
  },
  "meta": {
    "requestId": "abc123",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Pagination:**
- Response includes `nextToken` if more items exist
- Pass `nextToken` in next request to get next page
- `nextToken` is base64-encoded DynamoDB ExclusiveStartKey

---

#### 6. Update Product

**Endpoint:** `PUT /products/{id}`  
**Authentication:** Required  
**Description:** Update an existing product

**Path Parameters:**
- `id`: Product UUID

**Request Body:**
```json
{
  "name": "Wireless Keyboard Pro",
  "description": "Updated description",
  "category": "electronics",
  "price": 8999,
  "quantity": 45,
  "sku": "KB-MECH-001",
  "imageUrl": "https://example.com/new-image.jpg"
}
```

**Validation Rules:**
- All fields optional (only provided fields are updated)
- Same validation rules as Create Product

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Wireless Keyboard Pro",
    "description": "Updated description",
    "category": "electronics",
    "price": 8999,
    "quantity": 45,
    "sku": "KB-MECH-001",
    "imageUrl": "https://example.com/new-image.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:45:00.000Z",
    "createdBy": "user-cognito-sub",
    "isLowStock": false
  },
  "meta": {
    "requestId": "def456",
    "timestamp": "2024-01-15T12:45:00.000Z"
  }
}
```

---

#### 7. Delete Product

**Endpoint:** `DELETE /products/{id}`  
**Authentication:** Required  
**Description:** Delete a product

**Path Parameters:**
- `id`: Product UUID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Product deleted successfully",
    "deletedId": "550e8400-e29b-41d4-a716-446655440000"
  },
  "meta": {
    "requestId": "ghi789",
    "timestamp": "2024-01-15T13:00:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found"
  },
  "meta": {
    "requestId": "ghi789",
    "timestamp": "2024-01-15T13:00:00.000Z"
  }
}
```

---

#### 8. Create Order (Purchase)

**Endpoint:** `POST /orders`  
**Authentication:** Required  
**Description:** Create a new order (purchase a product)

**Request Body:**
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "quantity": 2
}
```

**Validation Rules:**
- `productId`: Valid UUID
- `quantity`: Positive integer

**Business Logic:**
1. Validate request
2. Check product exists
3. Verify sufficient stock
4. Atomically decrease stock
5. Create order record (status: PENDING)
6. Send message to SQS queue
7. Return order immediately

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "userId": "user-cognito-sub",
    "userEmail": "user@example.com",
    "productId": "550e8400-e29b-41d4-a716-446655440000",
    "productName": "Wireless Keyboard",
    "quantity": 2,
    "pricePerUnit": 7999,
    "totalAmount": 15998,
    "status": "PENDING",
    "createdAt": "2024-01-15T14:00:00.000Z",
    "updatedAt": "2024-01-15T14:00:00.000Z"
  },
  "meta": {
    "requestId": "jkl012",
    "timestamp": "2024-01-15T14:00:00.000Z"
  }
}
```

**Error Responses:**

*Product Not Found (404):*
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found"
  },
  "meta": {
    "requestId": "jkl012",
    "timestamp": "2024-01-15T14:00:00.000Z"
  }
}
```

*Insufficient Stock (409 Conflict):*
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock available",
    "details": {
      "requested": 5,
      "available": 3
    }
  },
  "meta": {
    "requestId": "jkl012",
    "timestamp": "2024-01-15T14:00:00.000Z"
  }
}
```

---

#### 9. Get Order

**Endpoint:** `GET /orders/{id}`  
**Authentication:** Required  
**Description:** Retrieve a single order by ID

**Path Parameters:**
- `id`: Order UUID

**Authorization:** User can only access their own orders

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "userId": "user-cognito-sub",
    "userEmail": "user@example.com",
    "productId": "550e8400-e29b-41d4-a716-446655440000",
    "productName": "Wireless Keyboard",
    "quantity": 2,
    "pricePerUnit": 7999,
    "totalAmount": 15998,
    "status": "CONFIRMED",
    "createdAt": "2024-01-15T14:00:00.000Z",
    "updatedAt": "2024-01-15T14:01:00.000Z"
  },
  "meta": {
    "requestId": "mno345",
    "timestamp": "2024-01-15T14:05:00.000Z"
  }
}
```

**Error Responses:**

*Order Not Found (404):*
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Order not found"
  },
  "meta": {
    "requestId": "mno345",
    "timestamp": "2024-01-15T14:05:00.000Z"
  }
}
```

*Forbidden (403):*
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this order"
  },
  "meta": {
    "requestId": "mno345",
    "timestamp": "2024-01-15T14:05:00.000Z"
  }
}
```

---

#### 10. List User Orders

**Endpoint:** `GET /orders`  
**Authentication:** Required  
**Description:** List authenticated user's order history

**Query Parameters:**
- `status` (optional): Filter by status (PENDING | CONFIRMED | CANCELLED)
- `limit` (optional): Number of items per page (default: 20, max: 100)
- `nextToken` (optional): Pagination token

**Example Requests:**
```
GET /orders
GET /orders?status=CONFIRMED
GET /orders?limit=10
GET /orders?status=CONFIRMED&nextToken=eyJQSyI6Ik9S...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "productName": "Wireless Keyboard",
        "quantity": 2,
        "totalAmount": 15998,
        "status": "CONFIRMED",
        "createdAt": "2024-01-15T14:00:00.000Z"
      },
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "productName": "USB Mouse",
        "quantity": 1,
        "totalAmount": 2999,
        "status": "PENDING",
        "createdAt": "2024-01-14T10:00:00.000Z"
      }
    ],
    "count": 2,
    "nextToken": null
  },
  "meta": {
    "requestId": "pqr678",
    "timestamp": "2024-01-15T14:10:00.000Z"
  }
}
```

---

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation errors, malformed requests |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Valid auth but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Business logic constraint (e.g., insufficient stock) |
| 500 | Internal Server Error | Unexpected server errors |

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  },
  "meta": {
    "requestId": "unique-request-id",
    "timestamp": "ISO-8601-timestamp"
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required or token invalid
- `FORBIDDEN`: Insufficient permissions
- `INSUFFICIENT_STOCK`: Not enough product quantity
- `INTERNAL_ERROR`: Server error

---

## 🔐 Security & IAM

### Authentication Flow

```
1. User Registration
   └─► POST to Cognito (via Amplify)
       └─► Email verification sent
           └─► User confirms email
               └─► Account activated

2. User Login
   └─► POST credentials to Cognito
       └─► Cognito validates credentials
           └─► Returns JWT tokens:
               ├─► ID Token (for API authorization)
               ├─► Access Token (for Cognito operations)
               └─► Refresh Token (to get new tokens)

3. API Request
   └─► Client includes: Authorization: Bearer <ID_TOKEN>
       └─► API Gateway validates token with Cognito
           ├─► Token valid? → Allow request
           └─► Token invalid? → 401 Unauthorized

4. Token Refresh (when expired)
   └─► Client sends Refresh Token to Cognito
       └─► Cognito validates Refresh Token
           └─► Returns new ID Token and Access Token
```

### IAM Roles & Permissions

Each Lambda function has a dedicated execution role with least-privilege permissions:

#### Product Functions IAM Policies

```yaml
createProduct:
  - Effect: Allow
    Action:
      - dynamodb:PutItem
    Resource: arn:aws:dynamodb:*:*:table/${self:provider.environment.TABLE_NAME}

getProduct:
  - Effect: Allow
    Action:
      - dynamodb:GetItem
    Resource: arn:aws:dynamodb:*:*:table/${self:provider.environment.TABLE_NAME}

listProducts:
  - Effect: Allow
    Action:
      - dynamodb:Scan
      - dynamodb:Query
    Resource:
      - arn:aws:dynamodb:*:*:table/${self:provider.environment.TABLE_NAME}
      - arn:aws:dynamodb:*:*:table/${self:provider.environment.TABLE_NAME}/index/GSI1

updateProduct:
  - Effect: Allow
    Action:
      - dynamodb:UpdateItem
      - dynamodb:GetItem
    Resource: arn:aws:dynamodb:*:*:table/${self:provider.environment.TABLE_NAME}

deleteProduct:
  - Effect: Allow
    Action:
      - dynamodb:DeleteItem
    Resource: arn:aws:dynamodb:*:*:table/${self:provider.environment.TABLE_NAME}
```

#### Order Functions IAM Policies

```yaml
createOrder:
  - Effect: Allow
    Action:
      - dynamodb:PutItem
      - dynamodb:UpdateItem
      - dynamodb:GetItem
    Resource: arn:aws:dynamodb:*:*:table/${self:provider.environment.TABLE_NAME}
  - Effect: Allow
    Action:
      - sqs:SendMessage
    Resource: arn:aws:sqs:*:*:${self:service}-${self:provider.stage}-order-queue

getOrder:
  - Effect: Allow
    Action:
      - dynamodb:GetItem
    Resource: arn:aws:dynamodb:*:*:table/${self:provider.environment.TABLE_NAME}

listOrders:
  - Effect: Allow
    Action:
      - dynamodb:Query
    Resource:
      - arn:aws:dynamodb:*:*:table/${self:provider.environment.TABLE_NAME}
      - arn:aws:dynamodb:*:*:table/${self:provider.environment.TABLE_NAME}/index/GSI1

processOrderNotification:
  - Effect: Allow
    Action:
      - sqs:ReceiveMessage
      - sqs:DeleteMessage
      - sqs:GetQueueAttributes
    Resource: arn:aws:sqs:*:*:${self:service}-${self:provider.stage}-order-queue
  - Effect: Allow
    Action:
      - sns:Publish
    Resource: arn:aws:sns:*:*:${self:service}-${self:provider.stage}-order-notifications
  - Effect: Allow
    Action:
      - dynamodb:UpdateItem
    Resource: arn:aws:dynamodb:*:*:table/${self:provider.environment.TABLE_NAME}

processOrderDLQ:
  - Effect: Allow
    Action:
      - sqs:ReceiveMessage
      - sqs:DeleteMessage
      - sqs:GetQueueAttributes
    Resource: arn:aws:sqs:*:*:${self:service}-${self:provider.stage}-order-dlq
  - Effect: Allow
    Action:
      - logs:CreateLogGroup
      - logs:CreateLogStream
      - logs:PutLogEvents
    Resource: arn:aws:logs:*:*:*
```

### Security Best Practices Implemented

1. **Authentication & Authorization**
   - JWT token validation on all protected endpoints
   - User-scoped data access (users can only see their own orders)
   - Token expiration (1 hour for ID tokens)

2. **Data Protection**
   - DynamoDB encryption at rest (AWS KMS)
   - HTTPS/TLS in transit (API Gateway, CloudFront)
   - Sensitive data not logged

3. **Least Privilege**
   - Each Lambda has minimal required permissions
   - No wildcard permissions
   - Resource-level IAM policies

4. **Input Validation**
   - Zod schema validation on all inputs
   - SQL injection prevention (NoSQL, parameterized queries)
   - XSS prevention (input sanitization)

5. **Secrets Management**
   - No hardcoded credentials
   - Environment variables for configuration
   - AWS Secrets Manager ready for production secrets

6. **API Security**
   - CORS configured for specific origins
   - Rate limiting (API Gateway default)
   - Request throttling (API Gateway)

7. **Monitoring & Auditing**
   - CloudWatch Logs for all Lambda functions
   - Structured logging with request IDs
   - Error tracking and alerting

---

## 🚀 Deployment & CI/CD

### Infrastructure as Code

All infrastructure is defined in code using Serverless Framework:

```
backend/
├── serverless.yml              # Main service configuration
└── resources/
    ├── dynamodb.yml            # DynamoDB table
    ├── cognito.yml             # User pool & authorizer
    ├── sqs.yml                 # SQS queues
    └── sns.yml                 # SNS topic
```

### Deployment Stages

| Stage | Branch | URL Pattern | Purpose |
|-------|--------|-------------|---------|
| `dev` | develop | `*-dev-*` | Development testing |
| `prod` | main | `*-prod-*` | Production environment |

### GitHub Actions Workflows

#### CI Workflow (`.github/workflows/ci.yml`)

**Trigger:** Push or Pull Request to any branch

**Steps:**
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Run ESLint
5. Run Prettier check
6. Run TypeScript type checking
7. Run unit tests
8. Run integration tests
9. Generate coverage report

**Status:** ✅ Must pass for PR merge

#### CD Workflow (`.github/workflows/cd.yml`)

**Trigger:** Push to `develop` or `main` branch

**Steps:**
1. Checkout code
2. Setup Node.js 18
3. Configure AWS credentials
4. Install dependencies
5. Install Serverless Framework
6. Deploy to appropriate stage:
   - `develop` → `dev`
   - `main` → `prod`
7. Run smoke tests
8. Notify deployment status

**Environment Variables:**
```yaml
env:
  AWS_REGION: us-east-1
  NODE_VERSION: 18

secrets:
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### Deployment Commands

```bash
# Backend Deployment
cd backend

# Deploy to dev
npm run deploy:dev

# Deploy to prod
npm run deploy:prod

# Remove infrastructure
npm run remove:dev
npm run remove:prod

# Frontend Deployment
cd frontend

# Build production bundle
npm run build

# Deploy to S3 + CloudFront
serverless deploy
```

### Post-Deployment Verification

```bash
# 1. Check health endpoint
curl https://s26yt7k27l.execute-api.us-east-1.amazonaws.com/prod/health

# 2. Verify CloudFront distribution
curl https://d3g8yrgnuos3zh.cloudfront.net

# 3. Check CloudWatch logs
aws logs tail /aws/lambda/inventory-api-prod-createProduct --follow

# 4. Monitor SQS queue
aws sqs get-queue-attributes \
  --queue-url <QUEUE_URL> \
  --attribute-names ApproximateNumberOfMessages
```

---

## 📈 Monitoring & Logging

### CloudWatch Logs

**Log Groups:**
```
/aws/lambda/inventory-api-prod-health
/aws/lambda/inventory-api-prod-createProduct
/aws/lambda/inventory-api-prod-getProduct
/aws/lambda/inventory-api-prod-listProducts
/aws/lambda/inventory-api-prod-updateProduct
/aws/lambda/inventory-api-prod-deleteProduct
/aws/lambda/inventory-api-prod-createOrder
/aws/lambda/inventory-api-prod-getOrder
/aws/lambda/inventory-api-prod-listOrders
/aws/lambda/inventory-api-prod-processOrderNotification
/aws/lambda/inventory-api-prod-processOrderDLQ
/aws/api-gateway/inventory-api-prod
```

### Structured Logging

All logs use structured JSON format for CloudWatch Logs Insights:

```json
{
  "timestamp": "2024-01-15T14:00:00.000Z",
  "level": "INFO",
  "requestId": "abc-123-def",
  "userId": "user-cognito-sub",
  "message": "Product created successfully",
  "context": {
    "productId": "550e8400-e29b-41d4-a716-446655440000",
    "sku": "KB-MECH-001"
  }
}
```

### CloudWatch Metrics

**Lambda Metrics:**
- Invocations
- Duration
- Errors
- Throttles
- Concurrent Executions

**DynamoDB Metrics:**
- ConsumedReadCapacityUnits
- ConsumedWriteCapacityUnits
- UserErrors
- SystemErrors

**SQS Metrics:**
- NumberOfMessagesSent
- NumberOfMessagesReceived
- ApproximateNumberOfMessagesVisible
- ApproximateAgeOfOldestMessage

**API Gateway Metrics:**
- Count (total requests)
- 4XXError
- 5XXError
- Latency
- IntegrationLatency

### CloudWatch Logs Insights Queries

**Query 1: Error Rate by Endpoint**
```sql
fields @timestamp, @message, requestId, userId
| filter level = "ERROR"
| stats count() by bin(5m)
```

**Query 2: Order Processing Time**
```sql
fields @timestamp, duration, orderId
| filter message like /Order created/
| stats avg(duration), max(duration), min(duration) by bin(1h)
```

**Query 3: Top Products Ordered**
```sql
fields productId, productName
| filter message like /Order created/
| stats count() as orderCount by productId, productName
| sort orderCount desc
| limit 10
```

**Query 4: Failed Order Notifications**
```sql
fields @timestamp, orderId, errorMessage
| filter level = "ERROR" and message like /notification failed/
| sort @timestamp desc
```

### Recommended CloudWatch Alarms

```yaml
Alarms:
  - Name: HighErrorRate
    Metric: Errors
    Threshold: > 10 errors in 5 minutes
    Action: SNS notification to admin
  
  - Name: HighDLQMessages
    Metric: ApproximateNumberOfMessagesVisible (DLQ)
    Threshold: > 5 messages
    Action: SNS notification to admin
  
  - Name: HighAPILatency
    Metric: IntegrationLatency
    Threshold: > 3000ms (p95)
    Action: SNS notification to admin
  
  - Name: LowStockAlert
    Metric: Custom metric (product.quantity < 10)
    Threshold: Triggered on low stock
    Action: SNS notification to admin
```

---

## 🧪 Testing Strategy

### Test Pyramid

```
                      ▲
                     / \
                    /   \
                   /  E2E \
                  /  Tests \
                 /-----------\
                /             \
               /  Integration  \
              /      Tests      \
             /-------------------\
            /                     \
           /      Unit Tests       \
          /_________________________\
```

### Unit Tests

**Coverage:** 85%+

**Test Files:**
```
backend/tests/unit/
├── validation/
│   ├── productSchema.test.ts
│   └── orderSchema.test.ts
├── services/
│   ├── productService.test.ts
│   ├── orderService.test.ts
│   └── notificationService.test.ts
├── repositories/
│   ├── productRepository.test.ts
│   └── orderRepository.test.ts
└── utils/
    ├── response.test.ts
    ├── errors.test.ts
    └── logger.test.ts
```

**Example Unit Test:**
```typescript
describe('ProductService', () => {
  describe('createProduct', () => {
    it('should create product with valid data', async () => {
      const input = {
        name: 'Test Product',
        description: 'Test description',
        category: 'electronics',
        price: 1000,
        quantity: 50,
        sku: 'TEST-001'
      };
      
      const result = await productService.createProduct(input, 'user-123');
      
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(input.name);
      expect(result.isLowStock).toBe(false);
    });
    
    it('should throw ValidationError for invalid price', async () => {
      const input = {
        name: 'Test Product',
        price: -100, // Invalid
        quantity: 50
      };
      
      await expect(
        productService.createProduct(input, 'user-123')
      ).rejects.toThrow(ValidationError);
    });
  });
});
```

### Integration Tests

**Test Files:**
```
backend/tests/integration/
├── api/
│   ├── products.test.ts
│   └── orders.test.ts
└── workflows/
    └── orderProcessing.test.ts
```

**Example Integration Test:**
```typescript
describe('Order Processing Workflow', () => {
  it('should process order end-to-end', async () => {
    // 1. Create product
    const product = await createTestProduct();
    
    // 2. Create order
    const order = await apiClient.post('/orders', {
      productId: product.id,
      quantity: 2
    });
    
    expect(order.status).toBe('PENDING');
    
    // 3. Simulate SQS processing
    await triggerSQSProcessor();
    
    // 4. Verify order confirmed
    const updatedOrder = await apiClient.get(`/orders/${order.id}`);
    expect(updatedOrder.status).toBe('CONFIRMED');
    
    // 5. Verify stock decreased
    const updatedProduct = await apiClient.get(`/products/${product.id}`);
    expect(updatedProduct.quantity).toBe(product.quantity - 2);
  });
});
```

### E2E Tests (Manual)

**Test Script:** `backend/scripts/test-api.sh`

```bash
#!/bin/bash
# Full API test suite

API_URL="https://s26yt7k27l.execute-api.us-east-1.amazonaws.com/prod"
AUTH_TOKEN="<your-jwt-token>"

# 1. Health check
curl "$API_URL/health"

# 2. Create product
PRODUCT_ID=$(curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "E2E test product",
    "category": "electronics",
    "price": 1000,
    "quantity": 100,
    "sku": "TEST-E2E-001"
  }' | jq -r '.data.id')

# 3. Get product
curl "$API_URL/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN"

# 4. Create order
ORDER_ID=$(curl -X POST "$API_URL/orders" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"quantity\": 2
  }" | jq -r '.data.id')

# 5. Wait for notification
sleep 5

# 6. Verify order confirmed
curl "$API_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN"

# 7. Cleanup
curl -X DELETE "$API_URL/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### Running Tests

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:coverage

# Watch mode (development)
npm run test:watch

# Specific test file
npm test -- productService.test.ts

# Integration tests (requires AWS credentials)
npm run test:integration

# E2E tests
chmod +x scripts/test-api.sh
./scripts/test-api.sh
```

---

## 📱 Frontend Implementation

### Technology Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite (fast HMR, optimized builds)
- **Styling:** Tailwind CSS (utility-first)
- **State Management:** React Query (server state), React Context (auth)
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios with interceptors
- **Auth:** AWS Amplify (Cognito integration)

### Project Structure

```
frontend/src/
├── components/
│   ├── ui/                     # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   ├── toast.tsx
│   │   └── toaster.tsx
│   ├── layout/                 # Layout components
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   └── ProtectedRoute.tsx
│   └── products/               # Product-specific components
│       └── ProductFormModal.tsx
├── pages/
│   ├── Landing.tsx             # Public landing page
│   ├── Products.tsx            # Product grid with filters
│   ├── ProductDetail.tsx       # Product details + order form
│   ├── Orders.tsx              # Order history
│   └── auth/
│       ├── Login.tsx
│       └── Signup.tsx
├── context/
│   └── AuthContext.tsx         # Authentication context
├── hooks/
│   ├── use-toast.ts            # Toast notifications
│   ├── use-products.ts         # Product API hooks (React Query)
│   └── use-orders.ts           # Order API hooks (React Query)
├── services/
│   └── api.ts                  # Axios client & API methods
├── config/
│   ├── amplify.ts              # Cognito configuration
│   └── api.ts                  # API endpoints
├── types/
│   └── index.ts                # TypeScript interfaces
├── lib/
│   └── utils.ts                # Utility functions (cn, formatters)
├── App.tsx                     # Root component with routes
├── main.tsx                    # React entry point
└── index.css                   # Global styles + Tailwind
```

### Pages & Features

#### 1. Landing Page (`/`)

**Purpose:** Marketing page with hero, features, and CTA

**Features:**
- Hero section with gradient background
- Feature cards (Fast Delivery, Secure Payment, 24/7 Support)
- Statistics (500+ Products, 1000+ Customers, 98% Satisfaction)
- CTA buttons (Get Started, Learn More)
- Responsive design

#### 2. Login Page (`/login`)

**Purpose:** User authentication

**Features:**
- Email + Password form
- Cognito integration via Amplify
- Form validation (React Hook Form + Zod)
- Error handling
- Redirect to products after login
- Link to signup page

#### 3. Signup Page (`/signup`)

**Purpose:** User registration

**Features:**
- Email + Password + Confirm Password form
- Cognito user pool registration
- Email verification flow
- Password strength requirements
- Error handling
- Auto-login after confirmation

#### 4. Products Page (`/products`)

**Purpose:** Browse and search products

**Features:**
- Product grid (responsive: 1/2/3/4 columns)
- Category filter dropdown
- Search by name
- Pagination with next/prev buttons
- Low stock badges
- Skeleton loading states
- "Add Product" button (admin feature)
- Click to view product details

**State Management:**
```typescript
// React Query with filters
const { data, isLoading, error } = useProducts({
  category: selectedCategory,
  search: searchTerm,
  limit: 20,
  nextToken: pageToken
});
```

#### 5. Product Detail Page (`/products/:id`)

**Purpose:** View product details and place order

**Features:**
- Product image, name, description
- Price display (formatted $XX.XX)
- Stock quantity with low stock warning
- Category badge
- Order form:
  - Quantity input (min: 1, max: available stock)
  - Total price calculation
  - Place Order button
- Edit/Delete buttons (admin feature)
- Back to products button

**Order Flow:**
```typescript
const { mutate: createOrder } = useCreateOrder({
  onSuccess: (order) => {
    toast.success('Order placed successfully!');
    navigate('/orders');
  },
  onError: (error) => {
    if (error.code === 'INSUFFICIENT_STOCK') {
      toast.error('Not enough stock available');
    }
  }
});
```

#### 6. Orders Page (`/orders`)

**Purpose:** View order history

**Features:**
- Table of user's orders
- Columns: Order ID, Product, Quantity, Total, Status, Date
- Status badges (PENDING: yellow, CONFIRMED: green)
- Pagination
- Empty state message
- Responsive table (stacked on mobile)

### Authentication Flow

```typescript
// AuthContext.tsx
interface AuthContextType {
  user: CognitoUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
}

// Protected Route
<Route
  path="/products"
  element={
    <ProtectedRoute>
      <Products />
    </ProtectedRoute>
  }
/>
```

### API Integration

```typescript
// services/api.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add auth token
apiClient.interceptors.request.use(async (config) => {
  const session = await Auth.currentSession();
  const token = session.getIdToken().getJwtToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// API methods
export const productApi = {
  list: (params) => apiClient.get('/products', { params }),
  get: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`)
};
```

### React Query Hooks

```typescript
// hooks/use-products.ts
export const useProducts = (filters: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.list(filters),
    select: (response) => response.data.data
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};
```

### Responsive Design

```css
/* Tailwind breakpoints */
sm:   640px   /* Tablet */
md:   768px   /* Laptop */
lg:   1024px  /* Desktop */
xl:   1280px  /* Large Desktop */
2xl:  1536px  /* Extra Large */

/* Product grid example */
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Products */}
</div>
```

### Performance Optimizations

1. **Code Splitting:** React Router lazy loading
2. **Image Optimization:** CloudFront caching, lazy loading
3. **Bundle Size:** Vite tree-shaking, minification
4. **Caching:** React Query caching, staleTime configuration
5. **Skeleton Screens:** Improved perceived performance

---

## 🔄 Order Processing Deep Dive

### State Machine

```
Order States:
┌─────────┐
│ PENDING │  ← Initial state when order created
└────┬────┘
     │
     │ (SQS processing successful)
     ▼
┌───────────┐
│ CONFIRMED │  ← Email sent, payment processed (future)
└───────────┘
     │
     │ (Future: user cancellation)
     ▼
┌───────────┐
│ CANCELLED │  ← Order cancelled
└───────────┘
```

### SQS Message Format

```json
{
  "MessageId": "abc-123-def",
  "Body": {
    "orderId": "660e8400-e29b-41d4-a716-446655440001",
    "userId": "user-cognito-sub",
    "userEmail": "user@example.com",
    "productId": "550e8400-e29b-41d4-a716-446655440000",
    "productName": "Wireless Keyboard",
    "quantity": 2,
    "pricePerUnit": 7999,
    "totalAmount": 15998,
    "status": "PENDING",
    "createdAt": "2024-01-15T14:00:00.000Z"
  },
  "MessageAttributes": {
    "OrderId": {
      "DataType": "String",
      "StringValue": "660e8400-e29b-41d4-a716-446655440001"
    },
    "UserId": {
      "DataType": "String",
      "StringValue": "user-cognito-sub"
    }
  }
}
```

### SNS Email Format

```
Subject: Order Confirmation - #{orderId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         ORDER CONFIRMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for your purchase!

ORDER DETAILS
───────────────────────────────────────
Order ID:    660e8400-e29b-41d4-a716-446655440001
Date:        Monday, January 15, 2024, 2:00 PM

ITEMS
───────────────────────────────────────
Wireless Keyboard
Quantity:    2
Unit Price:  $79.99
Total:       $159.98

SUMMARY
───────────────────────────────────────
Total Amount: $159.98
Status:       CONFIRMED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Retry & Error Handling

**Retry Strategy:**
1. **Attempt 1:** Immediate processing
2. **Attempt 2:** After 180 seconds (visibility timeout)
3. **Attempt 3:** After another 180 seconds
4. **DLQ:** After 3 failed attempts

**Common Errors & Handling:**

| Error | Cause | Handling |
|-------|-------|----------|
| SNS PublishException | SNS topic not accessible | Retry (transient error) |
| DynamoDB UpdateException | Order not found | Move to DLQ (permanent error) |
| JSON ParseError | Malformed message | Move to DLQ (permanent error) |
| Network Timeout | AWS service unavailable | Retry (transient error) |

**DLQ Processing:**
```typescript
// processOrderDLQ handler
export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    logger.error('Order processing permanently failed', {
      messageId: record.messageId,
      body: record.body,
      receiveCount: record.attributes.ApproximateReceiveCount
    });
    
    // Alert admin via SNS
    await sns.publish({
      TopicArn: ADMIN_TOPIC_ARN,
      Subject: 'ALERT: Order Processing Failed',
      Message: JSON.stringify({
        orderId: JSON.parse(record.body).orderId,
        error: 'Max retries exceeded'
      })
    });
  }
};
```

---

## 💰 Cost Optimization

### AWS Pricing Estimates (Low-Medium Traffic)

**Assumptions:**
- 10,000 API requests/month
- 100 orders/month
- 1 GB DynamoDB storage
- 5 GB CloudFront data transfer

| Service | Usage | Estimated Cost |
|---------|-------|----------------|
| **Lambda** | 10,000 invocations × 500 MB × 100ms | ~$0.20 |
| **API Gateway** | 10,000 requests | ~$0.04 |
| **DynamoDB** | 1 GB storage + on-demand reads/writes | ~$0.25 |
| **SQS** | 100 messages | ~$0.00 (free tier) |
| **SNS** | 100 notifications | ~$0.00 (free tier) |
| **Cognito** | 100 active users | ~$0.00 (free tier: <50k MAU) |
| **CloudFront** | 5 GB data transfer | ~$0.43 |
| **S3** | 1 GB storage + requests | ~$0.03 |
| **CloudWatch Logs** | 1 GB logs | ~$0.50 |
| **Total** | | **~$1.45/month** |

**Free Tier Benefits (First 12 months):**
- Lambda: 1M requests/month free
- API Gateway: 1M requests/month free
- DynamoDB: 25 GB storage + 25 read/write units free
- CloudFront: 1 TB data transfer free (12 months)
- S3: 5 GB storage + 20k GET, 2k PUT free

**Cost Optimization Strategies:**

1. **DynamoDB:**
   - Use on-demand pricing for unpredictable traffic
   - Switch to provisioned capacity for consistent traffic
   - Enable auto-scaling for provisioned mode

2. **Lambda:**
   - Right-size memory allocation (512 MB default)
   - Reduce cold starts with provisioned concurrency (if needed)
   - Use Lambda layers for shared dependencies

3. **CloudFront:**
   - Optimize cache hit ratio (longer TTL)
   - Use price class restrictions (All vs US/EU only)

4. **Logging:**
   - Set CloudWatch Logs retention (7-30 days)
   - Use log sampling for high-volume logs

5. **General:**
   - Delete unused resources
   - Monitor with AWS Cost Explorer
   - Set up billing alarms

---

## 🚀 Production Readiness Checklist

### Security
- [x] HTTPS/TLS encryption
- [x] JWT authentication
- [x] Input validation (Zod)
- [x] DynamoDB encryption at rest
- [x] IAM least privilege
- [x] CORS configuration
- [ ] Rate limiting (API Gateway throttling)
- [ ] DDoS protection (AWS Shield)
- [ ] Secrets Manager for sensitive data

### Reliability
- [x] Error handling
- [x] Retry logic (SQS)
- [x] Dead Letter Queue
- [x] Health check endpoint
- [ ] Multi-AZ deployment
- [ ] Backup strategy (DynamoDB PITR enabled)
- [ ] Disaster recovery plan

### Observability
- [x] Structured logging
- [x] CloudWatch Logs
- [x] Request ID tracking
- [ ] CloudWatch Alarms
- [ ] X-Ray tracing
- [ ] Custom metrics dashboard

### Performance
- [x] DynamoDB single-table design
- [x] Pagination
- [x] CloudFront CDN
- [x] Async processing (SQS)
- [ ] Lambda provisioned concurrency
- [ ] DynamoDB DAX caching
- [ ] API Gateway caching

### Testing
- [x] Unit tests (85%+ coverage)
- [x] Integration tests
- [ ] E2E tests (automated)
- [ ] Load testing
- [ ] Security testing (OWASP)

### DevOps
- [x] Infrastructure as Code (Serverless)
- [x] CI/CD pipeline (GitHub Actions)
- [x] Multi-environment (dev, prod)
- [ ] Blue-green deployment
- [ ] Automated rollback

### Documentation
- [x] API documentation (Swagger)
- [x] Technical documentation
- [x] README with setup instructions
- [ ] Runbook for operations
- [ ] Architecture decision records (ADR)

---

## 🛠️ Troubleshooting Guide

### Common Issues

#### 1. CORS Errors in Frontend

**Symptom:**
```
Access to XMLHttpRequest at 'https://...amazonaws.com/prod/products' 
from origin 'https://d3g8yrgnuos3zh.cloudfront.net' has been blocked by CORS policy
```

**Solution:**
- Verify `CORS_ORIGIN` in backend environment variables
- Check API Gateway CORS configuration
- Ensure `Authorization` header is allowed in CORS

**Fix:**
```yaml
# serverless.yml
provider:
  environment:
    CORS_ORIGIN: https://d3g8yrgnuos3zh.cloudfront.net
```

---

#### 2. 401 Unauthorized Errors

**Symptom:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authentication token"
  }
}
```

**Possible Causes:**
1. Token expired (1 hour validity)
2. Using Access Token instead of ID Token
3. Token not in Authorization header
4. User not confirmed in Cognito

**Solution:**
```typescript
// Use ID Token, not Access Token
const session = await Auth.currentSession();
const token = session.getIdToken().getJwtToken(); // ✅ Correct
// NOT: session.getAccessToken().getJwtToken() // ❌ Wrong
```

---

#### 3. Order Not Processing (Stuck in PENDING)

**Symptom:**
- Order created successfully
- Status remains PENDING
- No email received

**Debugging Steps:**

1. **Check SQS Queue:**
```bash
aws sqs get-queue-attributes \
  --queue-url <QUEUE_URL> \
  --attribute-names ApproximateNumberOfMessages
```

2. **Check Lambda Logs:**
```bash
aws logs tail /aws/lambda/inventory-api-prod-processOrderNotification --follow
```

3. **Check DLQ:**
```bash
aws sqs get-queue-attributes \
  --queue-url <DLQ_URL> \
  --attribute-names ApproximateNumberOfMessages
```

**Common Causes:**
- SNS topic email subscription not confirmed
- Lambda execution role missing SNS:Publish permission
- Network connectivity issues

---

#### 4. Insufficient Stock Error

**Symptom:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock available",
    "details": {
      "requested": 5,
      "available": 3
    }
  }
}
```

**Explanation:**
- This is correct behavior (race condition prevention)
- DynamoDB conditional update ensures atomic stock decrease

**Solution:**
- User should reduce order quantity
- Or wait for stock replenishment

---

#### 5. CloudFront Not Serving Latest Frontend

**Symptom:**
- Deployed new frontend
- Still seeing old version

**Solution:**
```bash
# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```

Or add to deployment script:
```yaml
# frontend/serverless.yml
invalidations:
  - /*
```

---

### Useful AWS CLI Commands

```bash
# List Cognito users
aws cognito-idp list-users \
  --user-pool-id <USER_POOL_ID>

# Describe DynamoDB table
aws dynamodb describe-table \
  --table-name inventory-api-prod

# Scan DynamoDB products
aws dynamodb scan \
  --table-name inventory-api-prod \
  --filter-expression "entityType = :type" \
  --expression-attribute-values '{":type":{"S":"PRODUCT"}}'

# View Lambda function
aws lambda get-function \
  --function-name inventory-api-prod-createProduct

# Invoke Lambda manually
aws lambda invoke \
  --function-name inventory-api-prod-health \
  response.json

# Check SQS messages
aws sqs receive-message \
  --queue-url <QUEUE_URL> \
  --max-number-of-messages 1

# Purge SQS queue
aws sqs purge-queue \
  --queue-url <QUEUE_URL>
```

---

## 📚 Additional Resources

### Documentation Links

- **AWS Serverless Framework:** https://www.serverless.com/framework/docs
- **AWS Lambda:** https://docs.aws.amazon.com/lambda/
- **Amazon DynamoDB:** https://docs.aws.amazon.com/dynamodb/
- **Amazon Cognito:** https://docs.aws.amazon.com/cognito/
- **Amazon SQS:** https://docs.aws.amazon.com/sqs/
- **Amazon SNS:** https://docs.aws.amazon.com/sns/
- **React Query:** https://tanstack.com/query/latest
- **AWS Amplify:** https://docs.amplify.aws/

### Project Repository

**GitHub:** [Your Repository URL]

**Key Branches:**
- `main`: Production deployment
- `develop`: Development deployment
- `feature/*`: Feature branches

---

## 📞 Support & Contact

**Technical Issues:**
- Review this documentation
- Check CloudWatch logs
- Review GitHub Issues

**Deployment Questions:**
- Check deployment logs in GitHub Actions
- Verify AWS credentials and permissions
- Review Serverless Framework output

---

## 📄 License

This project is private and confidential.

---

**Document Version:** 1.0.0  
**Last Updated:** February 2026  
**Author:** Madhur  
**Status:** Production Deployed ✅