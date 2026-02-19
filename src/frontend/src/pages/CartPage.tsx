import { useMemo, useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { Loader2, ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useGetCartContents, useRemoveFromCart } from '../hooks/useQueries';
import { formatPrice } from '../utils/formatPrice';
import { toast } from 'sonner';

export default function CartPage() {
  const navigate = useNavigate();
  const { data: cartItems = [], isLoading } = useGetCartContents();
  const removeFromCart = useRemoveFromCart();
  const [removingProductId, setRemovingProductId] = useState<bigint | null>(null);

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

  const handleRemoveFromCart = async (productId: bigint, productName: string) => {
    setRemovingProductId(productId);
    try {
      await removeFromCart.mutateAsync(productId);
      toast.success(`${productName} removed from cart`);
    } catch (error) {
      toast.error('Failed to remove product from cart');
      console.error('Error removing product from cart:', error);
    } finally {
      setRemovingProductId(null);
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
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartItemsWithLocalImages.map(({ product, quantity }) => (
              <Card key={Number(product.id)}>
                <CardContent className="flex gap-4 p-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Quantity: <span className="font-medium text-foreground">{Number(quantity)}</span>
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(product.price * Number(quantity))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFromCart(product.id, product.name)}
                      disabled={removingProductId === product.id}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      {removingProductId === product.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Link to="/checkout" className="w-full">
                <Button className="w-full" size="lg" disabled={cartItemsWithLocalImages.length === 0}>
                  Proceed to Checkout
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate({ to: '/' })}
              >
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
