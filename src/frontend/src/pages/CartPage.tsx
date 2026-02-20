import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, ShoppingCart, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetCartContents, useRemoveFromCart } from '../hooks/useQueries';
import { formatPrice } from '../utils/formatPrice';

export default function CartPage() {
  const navigate = useNavigate();
  const { data: cartItems = [], isLoading, error, refetch, isFetching } = useGetCartContents();
  const removeFromCart = useRemoveFromCart();
  const [removingItems, setRemovingItems] = useState<Set<bigint>>(new Set());

  const handleRemoveItem = async (productId: bigint) => {
    setRemovingItems((prev) => new Set(prev).add(productId));
    try {
      await removeFromCart.mutateAsync(productId);
    } finally {
      setRemovingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const subtotal = cartItems.reduce((sum, [product, quantity]) => {
    return sum + product.price * Number(quantity);
  }, 0);

  const total = subtotal;

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-24 w-24" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mx-auto max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Cart</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>We're having trouble loading your cart. Please try again.</p>
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="text-xs font-mono">
                {error instanceof Error ? error.message : 'Unknown error occurred'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                size="sm"
                disabled={isFetching}
                className="gap-2"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </>
                )}
              </Button>
              <Button 
                onClick={() => navigate({ to: '/' })} 
                variant="outline" 
                size="sm"
              >
                Back to Products
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 text-2xl font-bold">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">
            Add some delicious products to your cart to get started!
          </p>
          <Button onClick={() => navigate({ to: '/' })}>Browse Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartItems.map(([product, quantity]) => {
              const isRemoving = removingItems.has(product.id);
              
              return (
                <Card key={String(product.id)}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {quantity.toString()}
                            </p>
                            <p className="font-semibold">{formatPrice(product.price)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(product.id)}
                            disabled={isRemoving}
                            className="text-destructive hover:text-destructive"
                          >
                            {isRemoving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate({ to: '/checkout' })}
              >
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
