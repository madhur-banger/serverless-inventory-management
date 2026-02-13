import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct } from '@/hooks/use-products';
import { useCreateOrder } from '@/hooks/use-orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Package,
  ArrowLeft,
  AlertCircle,
  Minus,
  Plus,
  ShoppingCart,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Layout from '@/components/layout/Layout';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const { data, isLoading, error } = useProduct(id || '');
  const createOrder = useCreateOrder();

  const product = data?.data;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.quantity || 100)) {
      setQuantity(newQuantity);
    }
  };

  const handleOrder = async () => {
    if (!product) return;

    try {
      await createOrder.mutateAsync({
        productId: product.id,
        quantity,
      });
      setOrderSuccess(true);
      setQuantity(1);
    } catch {
      // Error is handled by the mutation
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <ProductDetailSkeleton />
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Product not found
          </h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/products">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Products
        </Link>

        {/* Order Success Banner */}
        {orderSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-6 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Order placed successfully!</p>
              <p className="text-sm">
                You will receive an email confirmation shortly.{' '}
                <Link
                  to="/orders"
                  className="underline font-medium hover:text-green-900"
                >
                  View your orders
                </Link>
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-24 w-24 text-gray-300" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">
                {product.category}
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatPrice(product.price)}
              </p>
            </div>

            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">SKU: {product.sku}</span>
              {product.lowStock ? (
                <Badge variant="warning">Low Stock</Badge>
              ) : (
                <Badge variant="success">{product.quantity} in stock</Badge>
              )}
            </div>

            {/* Order Form */}
            <div className="border-t pt-6 space-y-4">
              <div>
                <Label htmlFor="quantity" className="text-base">
                  Quantity
                </Label>
                <div className="flex items-center gap-3 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={product.quantity}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.min(Math.max(val, 1), product.quantity));
                    }}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-t border-b">
                <span className="text-gray-600">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleOrder}
                disabled={
                  createOrder.isPending ||
                  product.quantity === 0 ||
                  quantity > product.quantity
                }
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Place Order
                  </>
                )}
              </Button>

              {product.quantity === 0 && (
                <p className="text-center text-red-600 text-sm">
                  This product is currently out of stock
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <Skeleton className="h-5 w-32 mb-6" />
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <Skeleton className="aspect-square rounded-lg" />
        <div className="space-y-6">
          <div>
            <Skeleton className="h-6 w-24 mb-3" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-32 mt-2" />
          </div>
          <Skeleton className="h-24 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="border-t pt-6 space-y-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}