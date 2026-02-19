import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, Edit2, Check, X, LogOut, Package, Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAllProducts, useUpdateProductPrice, useOrders } from '../hooks/useQueries';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { formatPrice } from '../utils/formatPrice';
import type { Product } from '../backend';
import { toast } from 'sonner';
import { AddProductModal } from '../components/AddProductModal';
import { EditProductModal } from '../components/EditProductModal';

export default function AdminDashboard() {
  const { isAuthenticated, logout } = useAdminAuth();
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useGetAllProducts();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const updatePrice = useUpdateProductPrice();
  const [editingProductId, setEditingProductId] = useState<bigint | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/admin/login' });
    }
  }, [isAuthenticated, navigate]);

  // Map backend image URLs to local generated assets
  const productsWithLocalImages = useMemo(() => {
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

    return products.map((product) => ({
      ...product,
      imageUrl: imageMap[product.name] || product.imageUrl,
    }));
  }, [products]);

  // Sort orders by timestamp descending (most recent first)
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [orders]);

  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id);
    setEditPrice(product.price.toString());
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditPrice('');
  };

  const handleSavePrice = async (productId: bigint) => {
    const newPrice = parseFloat(editPrice);

    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error('Please enter a valid positive number');
      return;
    }

    try {
      await updatePrice.mutateAsync({
        productId,
        newPrice,
      });
      toast.success('Price updated successfully');
      setEditingProductId(null);
      setEditPrice('');
    } catch (error) {
      toast.error('Failed to update price');
      console.error(error);
    }
  };

  const handlePriceInputChange = (value: string) => {
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setEditPrice(value);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate({ to: '/admin/login' });
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatOrderItems = (items: [Product, bigint][]) => {
    return items.map(([product, quantity]) => `${product.name} (${Number(quantity)})`).join(', ');
  };

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your products and orders</p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="space-y-8">
        {/* Product Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Product Management</CardTitle>
              <Button onClick={() => setAddModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="w-40">Price</TableHead>
                    <TableHead className="w-32 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsWithLocalImages.map((product) => (
                    <TableRow key={Number(product.id)}>
                      <TableCell>
                        <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.category}</TableCell>
                      <TableCell>
                        {editingProductId === product.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm">₹</span>
                            <Input
                              type="text"
                              value={editPrice}
                              onChange={(e) => handlePriceInputChange(e.target.value)}
                              className="h-8 w-24"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span className="text-lg font-semibold text-primary">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingProductId === product.id ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleSavePrice(product.id)}
                              disabled={updatePrice.isPending}
                            >
                              {updatePrice.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={handleCancelEdit}
                              disabled={updatePrice.isPending}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleEditProduct(product)}
                              title="Edit product"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleEditClick(product)}
                              title="Quick edit price"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Orders Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <CardTitle>Customer Orders</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sortedOrders.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No orders yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Delivery Address</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedOrders.map((order, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {formatTimestamp(order.timestamp)}
                        </TableCell>
                        <TableCell>{order.phoneNumber}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={order.address}>
                            {order.address}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate" title={formatOrderItems(order.items)}>
                            {formatOrderItems(order.items)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {formatPrice(order.totalPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddProductModal open={addModalOpen} onOpenChange={setAddModalOpen} />
      <EditProductModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        product={selectedProduct}
      />
    </div>
  );
}
