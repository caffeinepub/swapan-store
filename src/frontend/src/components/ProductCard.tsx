import { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAddToCart } from '../hooks/useQueries';
import { formatPrice } from '../utils/formatPrice';
import type { Product } from '../backend';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useAddToCart();

  const handleAddToCart = async () => {
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity: BigInt(quantity),
      });
      toast.success(`Added ${quantity} ${product.name} to cart`);
      setQuantity(1);
    } catch (error) {
      toast.error('Failed to add to cart');
      console.error(error);
    }
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {product.category}
          </Badge>
        </div>
        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <p className="text-2xl font-bold text-primary">{formatPrice(product.price)}</p>
      </CardContent>
      <CardFooter className="flex items-center gap-2 p-4 pt-0">
        <div className="flex items-center gap-2 rounded-md border border-border">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={decrementQuantity}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={incrementQuantity}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button
          className="flex-1"
          onClick={handleAddToCart}
          disabled={addToCart.isPending}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}
