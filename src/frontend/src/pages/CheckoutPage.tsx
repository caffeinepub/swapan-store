import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useGetCartContents, usePlaceOrder } from '../hooks/useQueries';
import { formatPrice } from '../utils/formatPrice';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cartItems = [], isLoading } = useGetCartContents();
  const placeOrder = usePlaceOrder();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  // Map backend image URLs to local generated assets
  const cartItemsWithLocalImages = useMemo(() => {
    const imageMap: Record<string, string> = {
      'Turmeric Powder': '/assets/generated/turmeric-powder.dim_400x400.png',
      'Cumin Powder': '/assets/generated/cumin-seeds.dim_400x400.png',
      'Garam Masala': '/assets/generated/garam-masala.dim_400x400.png',
      'Red Chili Powder': '/assets/generated/masala-spices.dim_400x400.png',
      'Basmati Rice': '/assets/generated/basmati-rice.dim_400x400.png',
      'Yellow Lentils': '/assets/generated/red-lentils.dim_400x400.png',
      'Wheat Flour': '/assets/generated/wheat-flour.dim_400x400.png',
      'Chickpeas': '/assets/generated/chickpeas.dim_400x400.png',
      'Mustard Oil': '/assets/generated/mustard-oil.dim_400x400.png',
      'Coconut Oil': '/assets/generated/coconut-oil.dim_400x400.png',
      'Sunflower Oil': '/assets/generated/sunflower-oil.dim_400x400.png',
      'Sesame Oil': '/assets/generated/sesame-oil.dim_400x400.png',
    };

    return cartItems.map(([product, quantity]) => ({
      product: {
        ...product,
        imageUrl: imageMap[product.name] || product.imageUrl,
      },
      quantity,
    }));
  }, [cartItems]);

  const totalPrice = useMemo(() => {
    return cartItemsWithLocalImages.reduce(
      (sum, { product, quantity }) => sum + product.price * Number(quantity),
      0
    );
  }, [cartItemsWithLocalImages]);

  const totalItems = useMemo(() => {
    return cartItemsWithLocalImages.reduce((sum, { quantity }) => sum + Number(quantity), 0);
  }, [cartItemsWithLocalImages]);

  const handlePlaceOrder = async () => {
    // Validate inputs
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    if (!address.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }

    // Basic phone number validation (at least 10 digits)
    const phoneDigits = phoneNumber.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      await placeOrder.mutateAsync({
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
      });
      
      toast.success('Your order will be delivered today!', {
        duration: 5000,
      });
      
      // Navigate to products page after successful order
      navigate({ to: '/' });
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (cartItemsWithLocalImages.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 text-2xl font-bold">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">
            Add some delicious products to get started!
          </p>
          <Button onClick={() => navigate({ to: '/' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/cart' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your order
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Items & Contact Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItemsWithLocalImages.map(({ product, quantity }) => (
                <div key={Number(product.id)} className="flex gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Qty: {Number(quantity)} × {formatPrice(product.price)}
                      </p>
                    </div>
                    <p className="font-bold text-primary">
                      {formatPrice(product.price * Number(quantity))}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
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
                <Label htmlFor="address">Delivery Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your complete delivery address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
                Your order will be delivered today!
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
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
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate({ to: '/cart' })}
                disabled={placeOrder.isPending}
              >
                Back to Cart
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
