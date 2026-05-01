# 🎓 Serverless Inventory Management System — Workshop & Seminar

A production-grade, full-stack serverless inventory management system built on AWS, designed and presented as a **hands-on seminar** to teach enterprise-level serverless architecture, event-driven design, and modern DevOps practices.

> This project was built and demonstrated as part of a serverless workshop series conducted at colleges and developer meetups to help students and early-career developers gain real-world experience with AWS serverless technologies.

![AWS](https://img.shields.io/badge/AWS-Serverless-orange?logo=amazon-aws)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-black?logo=github-actions)

## 🌐 [Live Demo](https://d3g8yrgnuos3zh.cloudfront.net)

| Resource | URL |
|----------|-----|
| **Frontend** | [https://d3g8yrgnuos3zh.cloudfront.net](https://d3g8yrgnuos3zh.cloudfront.net) |
| **API Base URL** | [https://s26yt7k27l.execute-api.us-east-1.amazonaws.com/prod](https://s26yt7k27l.execute-api.us-east-1.amazonaws.com/prod) |
| **API Documentation** | [https://s26yt7k27l.execute-api.us-east-1.amazonaws.com/prod/docs](https://s26yt7k27l.execute-api.us-east-1.amazonaws.com/prod/docs) |

![alt text](images/home.png)

![alt text](images/architecture-aws.png)

## [Video Walkthrough](https://www.loom.com/share/823b20b6ea7c4872b9091f554a6a34fe)

## [CI/CD Pipeline Image](#-cicd-pipeline)

---

## 🎯 Seminar Overview

### What This Seminar Covers

This workshop was designed to take participants from zero serverless knowledge to deploying a fully working, production-grade application on AWS. Across multiple sessions, attendees learned:

- **Session 1 — Serverless Fundamentals:** What serverless is, why it matters, and how AWS Lambda, API Gateway, and DynamoDB fit together.
- **Session 2 — Building the Backend:** Hands-on coding of Lambda functions for CRUD operations, using TypeScript, Zod validation, and Middy middleware.
- **Session 3 — Event-Driven Architecture:** Wiring up SQS queues, SNS notifications, and Dead Letter Queues for reliable, asynchronous order processing.
- **Session 4 — Authentication & Security:** Implementing AWS Cognito for user signup/login, JWT-based route protection, and secure API design.
- **Session 5 — Frontend & Full-Stack Integration:** Building a React SPA with Vite and Tailwind CSS, connecting it to the serverless backend via API Gateway.
- **Session 6 — CI/CD & Deployment:** Setting up GitHub Actions pipelines for automated testing, linting, and multi-stage deployments to AWS.

### Who This Is For

- College students exploring cloud computing and serverless for the first time
- Early-career developers looking to build real AWS projects for their portfolio
- Anyone preparing for AWS certifications who wants hands-on practice

---

## 📋 Requirements Checklist

### Mandatory Requirements

| # | Requirement | Status | Evidence |
|---|-------------|--------|----------|
| 1 | **JavaScript/TypeScript** — Backend in Node.js, Frontend in React | ✅ Complete | Backend: `backend/src/**/*.ts`, Frontend: `frontend/src/**/*.tsx` |
| 2 | **Infrastructure as Code** — Serverless Framework | ✅ Complete | `backend/serverless.yml` + `backend/resources/*.yml` |
| 3 | **API Gateway + DynamoDB** | ✅ Complete | REST API storing data in DynamoDB single-table design |
| 4 | **Lambda CRUD Functions** | ✅ Complete | 13 Lambda functions |
| 5 | **CI/CD Multi-Stage Deployment** | ✅ Complete | GitHub Actions with stage logic (see [CI/CD Pipeline](#-cicd-pipeline)) |
| 6 | **Fully Working & Documented** | ✅ Complete | This README + Technical Documentation + Swagger API Docs |
| 7 | **Public GitHub Repository** | ✅ Complete | [Repository Link](https://github.com/madhur-banger/serverless-inventory-management) |
| 8 | **Loom Video Walkthrough** | 📹 Complete | [Video Walkthrough](https://www.loom.com/share/823b20b6ea7c4872b9091f554a6a34fe) |

### Optional Enhancements (All Implemented!)

| # | Enhancement | Status | Details |
|---|-------------|--------|---------|
| 1 | **Specific Business Case** | ✅ Complete | E-commerce Inventory Management with Orders & Notifications |
| 2 | **Lambda Packaging** | ✅ Complete | Individual packaging with tree-shaking, Middy middleware |
| 3 | **YAML Organization** | ✅ Complete | Modular resources: `resources/dynamodb.yml`, `resources/cognito.yml`, etc. |
| 4 | **Deployment Scripts** | ✅ Complete | `npm run deploy:dev`, `npm run deploy:prod`, test scripts |
| 5 | **Testing Suite** | ✅ Complete | Unit tests (Jest), Integration tests, E2E test scripts |
| 6 | **AWS Cognito Authentication** | ✅ Complete | Full signup/login flow, JWT protected routes |

---

## 🏗️ Architecture Overview

This architecture was walked through step-by-step during the seminar, explaining why each AWS service was chosen and how they connect in an event-driven pattern.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  React SPA (TypeScript + Vite + Tailwind CSS)                      │ │
│  │  • Product Browsing & Search                                        │ │
│  │  • Order Management                                                 │ │
│  │  • User Authentication (Cognito)                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│                                    ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Amazon CloudFront CDN  →  Amazon S3 (Static Hosting)              │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                   │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Amazon API Gateway (REST API)                                      │ │
│  │  • Cognito JWT Authorizer                                           │ │
│  │  • Request Validation                                               │ │
│  │  • Rate Limiting & CORS                                             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           COMPUTE LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Product CRUD │  │  Order CRUD  │  │  Notification │  │    Health   │ │
│  │  (5 Lambdas) │  │  (3 Lambdas) │  │   Processor   │  │    Check    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                     │                                    │
│                    ┌────────────────┴────────────────┐                  │
│                    │       Middy Middleware          │                  │
│                    │  • Error Handling • CORS        │                  │
│                    │  • JSON Parsing • Logging       │                  │
│                    └─────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA & MESSAGING LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   DynamoDB   │  │  Amazon SQS  │  │  Amazon SNS  │                  │
│  │  Single-Table │  │ Order Queue  │  │ Email Topic  │                  │
│  │    Design    │  │  + DLQ       │  │              │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION & MONITORING                          │
│  ┌──────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │  Amazon Cognito          │  │  Amazon CloudWatch                   │ │
│  │  • User Pool             │  │  • Lambda Logs & Metrics             │ │
│  │  • JWT Tokens            │  │  • API Gateway Logs                  │ │
│  │  • Email Verification    │  │  • SQS/DynamoDB Metrics              │ │
│  └──────────────────────────┘  └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Lambda Functions

| # | Function Name | HTTP Method | Endpoint | Description | Covered In |
|---|---------------|-------------|----------|-------------|------------|
| 1 | `health` | GET | `/health` | Service health check (public) | Session 2 |
| 2 | `getDocs` | GET | `/docs` | Swagger UI documentation (public) | Session 2 |
| 3 | `getDocsSpec` | GET | `/docs/spec` | OpenAPI 3.0 specification (public) | Session 2 |
| 4 | `createProduct` | POST | `/products` | Create new product | Session 2 |
| 5 | `getProduct` | GET | `/products/{id}` | Get product by ID | Session 2 |
| 6 | `listProducts` | GET | `/products` | List/search products | Session 2 |
| 7 | `updateProduct` | PUT | `/products/{id}` | Update product | Session 2 |
| 8 | `deleteProduct` | DELETE | `/products/{id}` | Delete product | Session 2 |
| 9 | `createOrder` | POST | `/orders` | Create order (purchase) | Session 3 |
| 10 | `getOrder` | GET | `/orders/{id}` | Get order by ID | Session 3 |
| 11 | `listOrders` | GET | `/orders` | List user's orders | Session 3 |
| 12 | `processOrderNotification` | SQS Trigger | — | Process order notifications | Session 3 |
| 13 | `processOrderDLQ` | SQS Trigger | — | Handle failed notifications | Session 3 |

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose | Taught In |
|------------|---------|---------|-----------|
| Node.js | 20.x | Runtime | Session 1 |
| TypeScript | 5.3+ | Type-safe development | Session 1 |
| Serverless Framework | 3.x | Infrastructure as Code | Session 2 |
| AWS Lambda | — | Serverless compute | Session 2 |
| API Gateway | REST | API management | Session 2 |
| DynamoDB | — | NoSQL database | Session 2 |
| Amazon SQS | — | Message queuing | Session 3 |
| Amazon SNS | — | Email notifications | Session 3 |
| Amazon Cognito | — | Authentication | Session 4 |
| Zod | 3.x | Runtime validation | Session 2 |
| Middy | 5.x | Lambda middleware | Session 2 |
| Jest | 29.x | Testing | Session 6 |

### Frontend

| Technology | Version | Purpose | Taught In |
|------------|---------|---------|-----------|
| React | 18.x | UI framework | Session 5 |
| TypeScript | 5.x | Type safety | Session 5 |
| Vite | 5.x | Build tool | Session 5 |
| Tailwind CSS | 3.x | Styling | Session 5 |
| React Query | 5.x | Server state | Session 5 |
| React Router | 6.x | Routing | Session 5 |
| AWS Amplify | 6.x | Cognito integration | Session 5 |
| Axios | 1.x | HTTP client | Session 5 |

---

## 📁 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── handlers/           # Lambda function handlers
│   │   │   ├── products/       # Product CRUD handlers
│   │   │   ├── orders/         # Order handlers
│   │   │   └── notifications/  # SQS processors
│   │   ├── services/           # Business logic
│   │   ├── repositories/       # Data access layer
│   │   ├── validation/         # Zod schemas
│   │   ├── middleware/         # Middy middleware
│   │   └── utils/              # Utilities (logger, errors, response)
│   ├── resources/              # Modular CloudFormation resources
│   │   ├── dynamodb.yml        # DynamoDB table
│   │   ├── cognito.yml         # User pool & authorizer
│   │   ├── sqs.yml             # Queues
│   │   └── sns.yml             # Topics
│   ├── tests/                  # Test suites
│   │   ├── unit/
│   │   └── integration/
│   ├── serverless.yml          # Main Serverless config
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── context/            # Auth context
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API services
│   │   └── types/              # TypeScript types
│   ├── serverless.yml          # Frontend deployment
│   ├── package.json
│   └── vite.config.ts
│
├── .github/
│   └── workflows/
│       ├── ci.yml              # Continuous Integration
│       └── cd.yml              # Continuous Deployment
│
├── docs/
│   └── technical-documentation.md
│
└── README.md
```

---

## 🚀 Quick Start (Follow Along with the Seminar)

### Prerequisites

- Node.js 18+
- AWS CLI configured with credentials
- npm or yarn

### Backend Setup

```bash
# Clone repository
git clone https://github.com/madhur-banger/serverless-inventory-management
cd serverless-inventory-system

# Install backend dependencies
cd backend
npm install

# Deploy to dev
npm run deploy:dev

# Deploy to production
npm run deploy:prod
```

### Frontend Setup

```bash
# Install frontend dependencies
cd frontend
npm install

# Update environment variables
cp .env.example .env
# Edit .env with your API URL and Cognito details

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to AWS
serverless deploy
```

---

## 🔄 CI/CD Pipeline

The project uses **5 GitHub Actions workflows** for comprehensive CI/CD, covered in depth during **Session 6**:

```
.github/workflows/
├── backend-ci.yml        # Backend linting & testing
├── backend-deploy.yml    # Backend deployment to AWS
├── frontend-ci.yml       # Frontend linting & testing
├── frontend-deploy.yml   # Frontend deployment to S3/CloudFront
└── destroy.yml           # Infrastructure teardown
```

### Backend CI/CD (`.github/workflows/backend-deploy.yml`)

**Triggers:** Push to `master` (paths: `backend/**`)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   CI Job    │────►│ Setup Job   │────►│ Deploy Job  │
│             │     │             │     │             │
│ • Checkout  │     │ • Determine │     │ • Configure │
│ • Install   │     │   stage     │     │   AWS creds │
│ • Lint      │     │ • Set env   │     │ • Serverless│
│ • Test      │     │             │     │   deploy    │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Pipeline Features:**
- ✅ **Concurrency control** — Prevents parallel deployments
- ✅ **CI gate** — Lint & tests must pass before deploy
- ✅ **npm caching** — Faster builds with dependency caching
- ✅ **Environment secrets** — Secure credential management
- ✅ **Deployment summary** — API URL in GitHub summary

### Frontend CI/CD (`.github/workflows/frontend-deploy.yml`)

**Triggers:** Push to `master` (paths: `frontend/**`)

```
┌─────────────┐     ┌─────────────────────────────────┐
│  Build Job  │────►│          Deploy Job             │
│             │     │                                 │
│ • Install   │     │ • Download artifact             │
│ • Build     │     │ • Serverless deploy             │
│ • Upload    │     │ • CloudFront cache invalidation │
│   artifact  │     │ • Deployment summary            │
└─────────────┘     └─────────────────────────────────┘
```

**Pipeline Features:**
- ✅ **Artifact passing** — Build once, deploy the artifact
- ✅ **CloudFront invalidation** — Automatic cache clearing
- ✅ **Stack output extraction** — Gets distribution ID & URL

### Multi-Stage Deployment

**Current Implementation:**
- `master` branch → `prod` stage

**Stage Configuration Logic:**
```yaml
if [[ "${{ github.ref }}" == "refs/heads/master" ]]; then
  echo "stage=prod"
else
  echo "stage=dev"
fi
```

![alt text](images/cicd-1.png)
![alt text](images/cicd-2.png)

---

## 📱 Frontend Features

### Pages

| Page | Route | Auth Required | Description |
|------|-------|---------------|-------------|
| Landing | `/` | ❌ | Marketing page with hero & features |
| Login | `/login` | ❌ | User authentication |
| Signup | `/signup` | ❌ | User registration |
| Products | `/products` | ✅ | Product catalog with filters |
| Product Detail | `/products/:id` | ✅ | Product info + order form |
| Orders | `/orders` | ✅ | Order history |

### Responsive Design

The application is fully responsive across all device sizes:

- **Mobile:** 320px – 639px
- **Tablet:** 640px – 1023px
- **Desktop:** 1024px+

![alt text](images/image.png)
![alt text](images/image-2.png)
![alt text](images/image-1.png)

---

## 🔐 Authentication Flow

```
1. User Registration
   └─► Cognito User Pool
       └─► Email Verification
           └─► Account Activated

2. User Login
   └─► Cognito Authentication
       └─► JWT Tokens Returned
           ├─► ID Token (API auth)
           ├─► Access Token
           └─► Refresh Token

3. Protected API Requests
   └─► Authorization: Bearer <ID_TOKEN>
       └─► API Gateway validates with Cognito
           └─► Request processed
```

---

## 📊 Database Design (DynamoDB Single-Table)

### Access Patterns

| Pattern | Operation | Key Condition |
|---------|-----------|---------------|
| Get Product by ID | GetItem | PK=`PRODUCT#<id>`, SK=`METADATA` |
| List Products by Category | Query GSI1 | GSI1PK=`CATEGORY#<cat>` |
| Get Order by ID | GetItem | PK=`ORDER#<id>`, SK=`METADATA` |
| List User Orders | Query GSI1 | GSI1PK=`USER#<userId>` |

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- productService.test.ts

# Run integration tests
npm run test:integration
```

---

## 📹 [Seminar Recording / Video Walkthrough](https://www.loom.com/share/823b20b6ea7c4872b9091f554a6a34fe)

[Video Link](https://www.loom.com/share/823b20b6ea7c4872b9091f554a6a34fe)

**Video Contents:**
1. Architecture overview
2. Code walkthrough (Backend)
3. Infrastructure as Code (Serverless)
4. CI/CD pipeline demonstration
5. Frontend features
6. Live demo

---

## 💰 Cost Estimate

For low-medium traffic (~10,000 requests/month):

| Service | Estimated Cost |
|---------|----------------|
| Lambda | ~$0.20 |
| API Gateway | ~$0.04 |
| DynamoDB | ~$0.25 |
| SQS/SNS | Free tier |
| Cognito | Free tier (<50k MAU) |
| CloudFront | ~$0.43 |
| **Total** | **~$1.45/month** |

---

## 📚 Documentation

- [Technical Documentation](docs/technical-documentation.md)
- [API Documentation (Swagger)](https://s26yt7k27l.execute-api.us-east-1.amazonaws.com/prod/docs)
- [OpenAPI Spec](https://s26yt7k27l.execute-api.us-east-1.amazonaws.com/prod/docs/spec)

---

## 👤 Author

**Madhur**

- AWS Community Builder (Serverless)
- AWS Solutions Architect Associate
- Conducted serverless workshops and seminars at colleges and developer communities

---

*Built with ❤️ using AWS Serverless — designed as a teaching resource to help developers learn serverless the right way.*
