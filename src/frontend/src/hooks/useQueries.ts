import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAdminAuth } from './useAdminAuth';
import type { Product, ProductId, Quantity, Order } from '../backend';
import { toast } from 'sonner';

// Query to fetch all products
export function useGetAllProducts() {
  const { actor } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('[useGetAllProducts] Query starting...');
      console.log('[useGetAllProducts] Actor available:', !!actor);
      
      if (!actor) {
        console.log('[useGetAllProducts] No actor, returning empty array');
        return [];
      }
      
      try {
        console.log('[useGetAllProducts] Calling backend.getAllProducts()...');
        const products = await actor.getAllProducts();
        console.log('[useGetAllProducts] Backend response:', products);
        console.log('[useGetAllProducts] Number of products:', products?.length ?? 0);
        
        // Validate products array
        if (!Array.isArray(products)) {
          console.error('[useGetAllProducts] Response is not an array:', products);
          throw new Error('Invalid response from backend: expected array of products');
        }
        
        // Validate each product
        const validProducts = products.filter((product, index) => {
          if (!product || typeof product !== 'object') {
            console.error(`[useGetAllProducts] Invalid product at index ${index}:`, product);
            return false;
          }
          
          if (!product.id || !product.name) {
            console.error(`[useGetAllProducts] Product missing required fields at index ${index}:`, product);
            return false;
          }
          
          return true;
        });
        
        if (validProducts.length !== products.length) {
          console.warn(`[useGetAllProducts] Filtered out ${products.length - validProducts.length} invalid products`);
        }
        
        console.log('[useGetAllProducts] Returning valid products:', validProducts);
        return validProducts;
      } catch (error) {
        console.error('[useGetAllProducts] Error fetching products:', error);
        console.error('[useGetAllProducts] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        throw error;
      }
    },
    enabled: !!actor,
    retry: 2,
    retryDelay: 1000,
  });
}

// Query to fetch cart contents
export function useGetCartContents() {
  const { actor } = useActor();

  return useQuery<[Product, Quantity][]>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCartContents();
    },
    enabled: !!actor,
  });
}

// Mutation to add product to cart
export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: ProductId; quantity: Quantity }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.addToCart(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

// Mutation to remove product from cart
export function useRemoveFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: ProductId) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.removeFromCart(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    },
  });
}

// Mutation to update product price
export function useUpdateProductPrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, newPrice }: { productId: ProductId; newPrice: number }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.updateProductPrice(productId, newPrice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Mutation to verify admin password
export function useVerifyAdminPassword() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (password: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.verifyAdminPassword(password);
    },
  });
}

// Mutation to place order
export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ phoneNumber, address }: { phoneNumber: string; address: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      
      // Get current cart items
      const cartItems = await actor.getCartContents();
      
      // Place order with cart items
      await actor.createOrder(phoneNumber, address, cartItems);
    },
    onSuccess: () => {
      // Invalidate cart query to reflect empty cart
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

// Query to fetch all orders (admin only)
export function useOrders() {
  const { actor } = useActor();
  const { isAuthenticated } = useAdminAuth();

  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && isAuthenticated,
  });
}

// Mutation to create a new product
export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      price,
      category,
      imageUrl,
    }: {
      name: string;
      description: string;
      price: number;
      category: string;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createProduct(name, description, price, category, imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Mutation to update a product
export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      name,
      description,
      price,
      category,
      imageUrl,
    }: {
      productId: ProductId;
      name?: string;
      description?: string;
      price?: number;
      category?: string;
      imageUrl?: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.updateProduct(
        productId,
        name ?? null,
        description ?? null,
        price ?? null,
        category ?? null,
        imageUrl ?? null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
