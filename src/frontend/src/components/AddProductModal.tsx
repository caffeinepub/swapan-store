import { useState } from 'react';
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
import { useCreateProduct } from '../hooks/useQueries';
import { toast } from 'sonner';

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProductModal({ open, onOpenChange }: AddProductModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const createProduct = useCreateProduct();

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setImageUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      await createProduct.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
        imageUrl: imageUrl.trim(),
      });
      toast.success('Product created successfully');
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create product');
      console.error(error);
    }
  };

  const handleCancel = () => {
    resetForm();
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
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new product to your catalog.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Turmeric Powder"
                disabled={createProduct.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description"
                rows={3}
                disabled={createProduct.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">₹</span>
                <Input
                  id="price"
                  type="text"
                  value={price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="0.00"
                  disabled={createProduct.isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={createProduct.isPending}>
                <SelectTrigger id="category">
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
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="e.g., /assets/generated/product.png"
                disabled={createProduct.isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createProduct.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createProduct.isPending}>
              {createProduct.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Product'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
