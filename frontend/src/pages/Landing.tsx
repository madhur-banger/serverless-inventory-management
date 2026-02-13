import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, Truck, Shield } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Package className="h-8 w-8" />
            <span className="text-xl font-semibold">Inventory</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Manage Your Inventory
            <br />
            <span className="text-gray-500">With Ease</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Browse products, place orders, and track your purchases. A simple,
            modern inventory management system built for efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto px-8">
                Create Account
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Everything You Need
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <FeatureCard
              icon={<Package className="h-10 w-10" />}
              title="Product Catalog"
              description="Browse through our extensive product catalog with detailed information."
            />
            <FeatureCard
              icon={<ShoppingCart className="h-10 w-10" />}
              title="Easy Ordering"
              description="Place orders with just a few clicks. Simple, fast, and efficient."
            />
            <FeatureCard
              icon={<Truck className="h-10 w-10" />}
              title="Order Tracking"
              description="Track your orders from placement to delivery with real-time updates."
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10" />}
              title="Secure & Reliable"
              description="Your data is protected with enterprise-grade security measures."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Join thousands of users who trust our platform for their inventory
            needs.
          </p>
          <Link to="/signup">
            <Button size="lg" className="px-8">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2024 Inventory Management. Built with React & AWS.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="text-gray-900 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}