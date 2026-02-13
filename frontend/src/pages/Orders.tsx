import { Link } from 'react-router-dom';
import { useOrders } from '@/hooks/use-orders';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, AlertCircle, Package, ArrowRight } from 'lucide-react';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import Layout from '@/components/layout/Layout';

export default function Orders() {
  const { data, isLoading, error } = useOrders();

  const orders = data?.data?.items || [];

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-600">View and track your orders</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Failed to load orders</p>
              <p className="text-sm">{(error as Error).message}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && orders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No orders yet
            </h3>
            <p className="text-gray-600 mb-6">
              When you place an order, it will appear here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center text-gray-900 font-medium hover:underline"
            >
              Browse Products
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border rounded-lg overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-4 sm:p-6 border-b bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-mono text-sm text-gray-900">
                        {order.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Placed on</p>
                        <p className="text-sm text-gray-900">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4"
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/products/${item.productId}`}
                            className="font-medium text-gray-900 hover:text-gray-600 transition-colors"
                          >
                            {item.productName}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            Qty: {item.quantity} ×{' '}
                            {formatPrice(item.pricePerUnit)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatPrice(item.totalPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="mt-6 pt-4 border-t flex items-center justify-between">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function OrderSkeleton() {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="p-4 sm:p-6 border-b bg-gray-50">
        <div className="flex justify-between">
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="w-16 h-16 rounded-md" />
          <div className="flex-1">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="mt-6 pt-4 border-t flex justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>
  );
}