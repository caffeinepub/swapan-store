import { Link, useNavigate, useMatchRoute } from '@tanstack/react-router';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetCartContents } from '../hooks/useQueries';

export default function Header() {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  const { data: cartItems = [] } = useGetCartContents();

  const totalItems = cartItems.reduce((sum, [, quantity]) => sum + Number(quantity), 0);
  const isAdminActive = matchRoute({ to: '/admin' });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/assets/generated/swapan-store-logo.dim_200x200.png"
            alt="Swapan Store"
            className="h-10 w-10 rounded-full"
          />
          <div>
            <h1 className="text-xl font-bold text-primary">Swapan Store</h1>
            <p className="text-xs text-muted-foreground">Indian Masalas & Groceries</p>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Products
          </Link>
          <Link
            to="/admin"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isAdminActive ? 'text-primary' : 'text-foreground'
            }`}
          >
            Admin
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="relative"
            onClick={() => navigate({ to: '/cart' })}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {totalItems}
              </Badge>
            )}
          </Button>
        </nav>
      </div>
    </header>
  );
}
