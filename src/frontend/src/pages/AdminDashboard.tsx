import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, Plus, Edit, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllProducts, useUpdateProductPrice, useOrders } from '../hooks/useQueries';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { formatPrice } from '../utils/formatPrice';
import { AddProductModal } from '../components/AddProductModal';
import { EditProductModal } from '../components/EditProductModal';
import type { Product } from '../backend';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAdminAuth();
  const { data: products = [], isLoading: productsLoading, error: productsError, refetch: refetchProducts, isFetching: productsFetching } = useGetAllProducts();
  const { data: orders = [], isLoading: ordersLoading, error: ordersError, refetch: refetchOrders, isFetching: ordersFetching } = useOrders();
  const updatePrice = useUpdateProductPrice();
  const [editingPrice, setEditingPrice] = useState<bigint | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/admin/login' });
    }
  }, [isAuthenticated, navigate]);

  const handlePriceEdit = (productId: bigint, currentPrice: number) => {
    setEditingPrice(productId);
    setNewPrice(currentPrice.toString());
  };

  const handlePriceSave = async (productId: bigint) => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      return;
    }

    try {
      await updatePrice.mutateAsync({ productId, newPrice: price });
      setEditingPrice(null);
    } catch (error) {
      console.error('Error updating price:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate({ to: '/admin/login' });
  };

  if (!isAuthenticated) {
    return null;
  }

  // Loading state
  if (productsLoading || ordersLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="space-y-8">
        {/* Products Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Products</CardTitle>
            <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </CardHeader>
          <CardContent>
            {productsError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Products</AlertTitle>
                <AlertDescription className="mt-2 space-y-3">
                  <p>Unable to load products. Please try again.</p>
                  <div className="rounded-md bg-destructive/10 p-3">
                    <p className="text-xs font-mono">
                      {productsError instanceof Error ? productsError.message : 'Unknown error'}
                    </p>
                  </div>
                  <Button 
                    onClick={() => refetchProducts()} 
                    variant="outline" 
                    size="sm"
                    disabled={productsFetching}
                    className="gap-2"
                  >
                    {productsFetching ? (
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
                </AlertDescription>
              </Alert>
            ) : products.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No products available</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={String(product.id)}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        {editingPrice === product.id ? (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              className="w-24"
                              step="0.01"
                            />
                            <Button
                              size="sm"
                              onClick={() => handlePriceSave(product.id)}
                              disabled={updatePrice.isPending}
                            >
                              {updatePrice.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Save'
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingPrice(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePriceEdit(product.id, product.price)}
                            className="hover:underline"
                          >
                            {formatPrice(product.price)}
                          </button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingProduct(product)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Orders Section */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Orders</AlertTitle>
                <AlertDescription className="mt-2 space-y-3">
                  <p>Unable to load orders. Please try again.</p>
                  <div className="rounded-md bg-destructive/10 p-3">
                    <p className="text-xs font-mono">
                      {ordersError instanceof Error ? ordersError.message : 'Unknown error'}
                    </p>
                  </div>
                  <Button 
                    onClick={() => refetchOrders()} 
                    variant="outline" 
                    size="sm"
                    disabled={ordersFetching}
                    className="gap-2"
                  >
                    {ordersFetching ? (
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
                </AlertDescription>
              </Alert>
            ) : orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No orders yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">
                        {order.customerPrincipal.toString().slice(0, 8)}...
                      </TableCell>
                      <TableCell>{order.phoneNumber}</TableCell>
                      <TableCell className="max-w-xs truncate">{order.address}</TableCell>
                      <TableCell>{order.items.length}</TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(order.totalPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AddProductModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
        />
      )}
    </div>
  );
}
