# Inventory Management Frontend

A React-based frontend for the Inventory Management System. Built with React, TypeScript, Tailwind CSS, and AWS Amplify for authentication.

## 🚀 Features

- **Authentication**: Full Cognito authentication with signup, login, and email confirmation
- **Product Catalog**: Browse products with search and category filters
- **Product Details**: View detailed product information and place orders
- **Order History**: Track all your orders and their status
- **Responsive Design**: Works on mobile, tablet, and desktop

## 🛠️ Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **React Router v6** - Routing
- **TanStack Query** - Data Fetching
- **AWS Amplify** - Authentication
- **Radix UI** - Accessible Components

## 📦 Project Structure
```
src/
├── components/
│   ├── layout/          # Layout components (Header, Layout, ProtectedRoute)
│   └── ui/              # Reusable UI components
├── config/              # Configuration (API, Amplify)
├── context/             # React Context (Auth)
├── hooks/               # Custom hooks (useProducts, useOrders, useToast)
├── lib/                 # Utilities
├── pages/               # Page components
│   ├── auth/            # Login, Signup
│   ├── Landing.tsx
│   ├── Products.tsx
│   ├── ProductDetail.tsx
│   └── Orders.tsx
├── services/            # API services
├── types/               # TypeScript types
├── App.tsx
├── main.tsx
└── index.css
```

## 🏃‍♂️ Local Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

Create a `.env` file:
```env
VITE_API_URL=https://your-api-gateway-url.amazonaws.com/prod
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_AWS_REGION=us-east-1
```

## 🚀 Deployment

### Deploy to AWS (S3 + CloudFront)
```bash
# Install serverless plugin
npm install -g serverless
npm install --save-dev serverless-s3-sync

# Build the app
npm run build

# Deploy to AWS
serverless deploy --stage prod
```

After deployment, you'll get output like:
```
CloudFrontDomainName: d1234567890.cloudfront.net
WebsiteURL: https://d1234567890.cloudfront.net
```

### Invalidate CloudFront Cache (after updates)
```bash
# Get distribution ID from serverless output
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Laptop**: 1024px - 1280px
- **Desktop**: > 1280px

## 🔗 API Endpoints

The frontend connects to these backend endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/products` | GET | List products |
| `/products/:id` | GET | Get product |
| `/orders` | GET | List user orders |
| `/orders` | POST | Create order |
| `/orders/:id` | GET | Get order |

## 🎨 Color Palette

The app uses a neutral gray color scheme:

- **Primary**: Gray-900 (#111827)
- **Secondary**: Gray-600 (#4B5563)
- **Background**: White / Gray-50
- **Borders**: Gray-200
- **Success**: Green-600
- **Warning**: Yellow-600
- **Error**: Red-600

## 📝 License

MIT