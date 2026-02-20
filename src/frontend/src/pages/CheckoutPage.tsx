import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetCartContents, usePlaceOrder } from '../hooks/useQueries';
import { formatPrice } from '../utils/formatPrice';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cartItems = [], isLoading, error, refetch, isFetching } = useGetCartContents();
  const placeOrder = usePlaceOrder();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  const total = cartItems.reduce((sum, [product, quantity]) => {
    return sum + product.price * Number(quantity);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || !address) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await placeOrder.mutateAsync({ phoneNumber, address });
      toast.success('Order placed successfully! Your order will be delivered today!');
      navigate({ to: '/' });
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Skeleton className="mb-6 h-10 w-48" />
          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </CardContent>
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
          <AlertTitle>Error Loading Checkout</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>We're having trouble loading your cart for checkout. Please try again.</p>
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
                onClick={() => navigate({ to: '/cart' })} 
                variant="outline" 
                size="sm"
              >
                Back to Cart
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty cart redirect
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <h2 className="mb-2 text-2xl font-bold">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">
            Add some products to your cart before checking out.
          </p>
          <Button onClick={() => navigate({ to: '/' })}>Browse Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

      <div className="mx-auto max-w-4xl">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <textarea
                    id="address"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your complete delivery address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cartItems.map(([product, quantity]) => (
                    <div key={String(product.id)} className="flex items-center gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {quantity.toString()}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">{formatPrice(product.price)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={placeOrder.isPending}
                >
                  {placeOrder.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Your order will be delivered today!
                </p>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
