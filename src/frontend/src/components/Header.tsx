import { Link, useNavigate, useMatchRoute } from '@tanstack/react-router';
import { ShoppingCart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useGetCartContents } from '../hooks/useQueries';

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function Header({ searchQuery = '', onSearchChange }: HeaderProps) {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  const { data: cartItems = [] } = useGetCartContents();

  const totalItems = cartItems.reduce((sum, [, quantity]) => sum + Number(quantity), 0);
  const isAdminActive = matchRoute({ to: '/admin' });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img
            src="/assets/generated/swapan-store-logo.dim_200x200.png"
            alt="Swapan Store"
            className="h-10 w-10 rounded-full"
          />
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-primary">Swapan Store</h1>
            <p className="text-xs text-muted-foreground">Indian Masalas & Groceries</p>
          </div>
        </Link>

        {/* Search Bar */}
        {onSearchChange && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-background/50 border-border focus:border-primary"
            />
          </div>
        )}

        <nav className="flex items-center gap-4 shrink-0">
          <Link
            to="/"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary hidden md:inline"
          >
            Products
          </Link>
          <Link
            to="/admin"
            className={`text-sm font-medium transition-colors hover:text-primary hidden md:inline ${
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
