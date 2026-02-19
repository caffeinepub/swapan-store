import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateProduct } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { Product } from '../backend';

interface EditProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function EditProductModal({ open, onOpenChange, product }: EditProductModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const updateProduct = useUpdateProduct();

  // Populate form when product changes
  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price.toString());
      setCategory(product.category);
      setImageUrl(product.imageUrl);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product) return;

    // Validation
    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!description.trim()) {
      toast.error('Product description is required');
      return;
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast.error('Please enter a valid positive price');
      return;
    }
    if (!category) {
      toast.error('Please select a category');
      return;
    }
    if (!imageUrl.trim()) {
      toast.error('Image URL is required');
      return;
    }

    try {
      await updateProduct.mutateAsync({
        productId: product.id,
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
        imageUrl: imageUrl.trim(),
      });
      toast.success('Product updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update product');
      console.error(error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handlePriceChange = (value: string) => {
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPrice(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the product details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Turmeric Powder"
                disabled={updateProduct.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description"
                rows={3}
                disabled={updateProduct.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Price</Label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">₹</span>
                <Input
                  id="edit-price"
                  type="text"
                  value={price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="0.00"
                  disabled={updateProduct.isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={updateProduct.isPending}>
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masalas">Masalas</SelectItem>
                  <SelectItem value="groceries">Groceries</SelectItem>
                  <SelectItem value="food oils">Food Oils</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-imageUrl">Image URL</Label>
              <Input
                id="edit-imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="e.g., /assets/generated/product.png"
                disabled={updateProduct.isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updateProduct.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateProduct.isPending}>
              {updateProduct.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
