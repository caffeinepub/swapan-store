import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAdminAuth } from './useAdminAuth';
import type { Product, ProductId, Quantity, Order } from '../backend';
import { toast } from 'sonner';

// Query to fetch all products
export function useGetAllProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.group(`[useGetAllProducts ${timestamp}] Query Execution`);
      
      try {
        console.log(`[useGetAllProducts ${timestamp}] Actor status:`, {
          hasActor: !!actor,
          actorFetching,
        });
        
        if (!actor) {
          console.warn(`[useGetAllProducts ${timestamp}] No actor available, returning empty array`);
          console.groupEnd();
          return [];
        }
        
        // Validate actor has the method
        if (typeof actor.getAllProducts !== 'function') {
          console.error(`[useGetAllProducts ${timestamp}] Actor missing getAllProducts method`);
          console.error(`[useGetAllProducts ${timestamp}] Actor type:`, typeof actor);
          console.error(`[useGetAllProducts ${timestamp}] Actor keys:`, Object.keys(actor));
          throw new Error('Actor is missing getAllProducts method');
        }
        
        console.log(`[useGetAllProducts ${timestamp}] Calling actor.getAllProducts()...`);
        const startTime = performance.now();
        
        const rawResponse = await actor.getAllProducts();
        
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);
        
        console.log(`[useGetAllProducts ${timestamp}] Backend response received in ${duration}ms`);
        console.log(`[useGetAllProducts ${timestamp}] Raw response:`, rawResponse);
        console.log(`[useGetAllProducts ${timestamp}] Response type:`, typeof rawResponse);
        console.log(`[useGetAllProducts ${timestamp}] Is array:`, Array.isArray(rawResponse));
        console.log(`[useGetAllProducts ${timestamp}] Array length:`, rawResponse?.length ?? 'N/A');
        
        // Validate response is an array
        if (!Array.isArray(rawResponse)) {
          console.error(`[useGetAllProducts ${timestamp}] Response is not an array:`, rawResponse);
          throw new Error('Invalid response from backend: expected array of products');
        }
        
        if (rawResponse.length === 0) {
          console.warn(`[useGetAllProducts ${timestamp}] Backend returned empty array - no products in database`);
          console.groupEnd();
          return [];
        }
        
        // Log first product structure for debugging
        if (rawResponse.length > 0) {
          console.log(`[useGetAllProducts ${timestamp}] First product structure:`, {
            raw: rawResponse[0],
            keys: Object.keys(rawResponse[0]),
            id: rawResponse[0].id,
            idType: typeof rawResponse[0].id,
            name: rawResponse[0].name,
            price: rawResponse[0].price,
            priceType: typeof rawResponse[0].price,
          });
        }
        
        // Transform and validate each product
        const transformedProducts = rawResponse.map((product, index) => {
          if (!product || typeof product !== 'object') {
            console.error(`[useGetAllProducts ${timestamp}] Invalid product at index ${index}:`, product);
            return null;
          }
          
          if (!product.id || !product.name) {
            console.error(`[useGetAllProducts ${timestamp}] Product missing required fields at index ${index}:`, {
              product,
              hasId: !!product.id,
              hasName: !!product.name,
            });
            return null;
          }
          
          // Ensure all fields are properly typed
          const transformedProduct: Product = {
            id: product.id,
            name: product.name || '',
            description: product.description || '',
            price: typeof product.price === 'number' ? product.price : 0,
            category: product.category || '',
            imageUrl: product.imageUrl || '',
          };
          
          if (index < 3) { // Log first 3 products
            console.log(`[useGetAllProducts ${timestamp}] Transformed product ${index}:`, {
              id: transformedProduct.id,
              name: transformedProduct.name,
              price: transformedProduct.price,
              category: transformedProduct.category,
              imageUrl: transformedProduct.imageUrl,
            });
          }
          
          return transformedProduct;
        }).filter((p): p is Product => p !== null);
        
        if (transformedProducts.length !== rawResponse.length) {
          console.warn(`[useGetAllProducts ${timestamp}] Filtered out ${rawResponse.length - transformedProducts.length} invalid products`);
        }
        
        console.log(`[useGetAllProducts ${timestamp}] ✅ Returning ${transformedProducts.length} valid products`);
        console.groupEnd();
        return transformedProducts;
      } catch (error) {
        console.error(`[useGetAllProducts ${timestamp}] ❌ ERROR during query execution:`);
        console.error(`[useGetAllProducts ${timestamp}] Error type:`, error?.constructor?.name);
        console.error(`[useGetAllProducts ${timestamp}] Error message:`, error instanceof Error ? error.message : 'Unknown error');
        console.error(`[useGetAllProducts ${timestamp}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
        console.error(`[useGetAllProducts ${timestamp}] Full error:`, error);
        console.groupEnd();
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 3,
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * 2 ** attemptIndex, 10000);
      console.log(`[useGetAllProducts] Retry attempt ${attemptIndex + 1}, waiting ${delay}ms`);
      return delay;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}

// Query to fetch cart contents
export function useGetCartContents() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[Product, Quantity][]>({
    queryKey: ['cart'],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[useGetCartContents ${timestamp}] Query starting...`);
      
      if (!actor) {
        console.warn(`[useGetCartContents ${timestamp}] No actor available`);
        return [];
      }
      
      try {
        console.log(`[useGetCartContents ${timestamp}] Calling backend.getCartContents()...`);
        const cart = await actor.getCartContents();
        console.log(`[useGetCartContents ${timestamp}] Cart contents:`, cart);
        return cart;
      } catch (error) {
        console.error(`[useGetCartContents ${timestamp}] Error:`, error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    retryDelay: 1000,
  });
}

// Mutation to add product to cart
export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: ProductId; quantity: Quantity }) => {
      const timestamp = new Date().toISOString();
      console.log(`[useAddToCart ${timestamp}] Adding to cart:`, { productId, quantity });
      
      if (!actor) throw new Error('Actor not initialized');
      
      await actor.addToCart(productId, quantity);
      console.log(`[useAddToCart ${timestamp}] Successfully added to cart`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      console.error('[useAddToCart] Error:', error);
      toast.error('Failed to add item to cart');
    },
  });
}

// Mutation to remove product from cart
export function useRemoveFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: ProductId) => {
      const timestamp = new Date().toISOString();
      console.log(`[useRemoveFromCart ${timestamp}] Removing from cart:`, productId);
      
      if (!actor) throw new Error('Actor not initialized');
      
      await actor.removeFromCart(productId);
      console.log(`[useRemoveFromCart ${timestamp}] Successfully removed from cart`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      console.error('[useRemoveFromCart] Error:', error);
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
    onError: (error) => {
      console.error('[useUpdateProductPrice] Error:', error);
      toast.error('Failed to update product price');
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
      const timestamp = new Date().toISOString();
      console.log(`[usePlaceOrder ${timestamp}] Placing order...`);
      
      if (!actor) throw new Error('Actor not initialized');
      
      // Get current cart items
      const cartItems = await actor.getCartContents();
      console.log(`[usePlaceOrder ${timestamp}] Cart items:`, cartItems);
      
      // Place order with cart items
      await actor.createOrder(phoneNumber, address, cartItems);
      console.log(`[usePlaceOrder ${timestamp}] Order placed successfully`);
    },
    onSuccess: () => {
      // Invalidate cart query to reflect empty cart
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      console.error('[usePlaceOrder] Error:', error);
      toast.error('Failed to place order');
    },
  });
}

// Query to fetch all orders (admin only)
export function useOrders() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isAuthenticated } = useAdminAuth();

  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[useOrders ${timestamp}] Fetching orders...`);
      
      if (!actor) {
        console.warn(`[useOrders ${timestamp}] No actor available`);
        return [];
      }
      
      try {
        const orders = await actor.getAllOrders();
        console.log(`[useOrders ${timestamp}] Orders fetched:`, orders);
        return orders;
      } catch (error) {
        console.error(`[useOrders ${timestamp}] Error:`, error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: 2,
    retryDelay: 1000,
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
      const timestamp = new Date().toISOString();
      console.log(`[useCreateProduct ${timestamp}] Creating product:`, { name, price, category });
      
      if (!actor) throw new Error('Actor not initialized');
      
      const productId = await actor.createProduct(name, description, price, category, imageUrl);
      console.log(`[useCreateProduct ${timestamp}] Product created with ID:`, productId);
      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error) => {
      console.error('[useCreateProduct] Error:', error);
      toast.error('Failed to create product');
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
      const timestamp = new Date().toISOString();
      console.log(`[useUpdateProduct ${timestamp}] Updating product:`, productId);
      
      if (!actor) throw new Error('Actor not initialized');
      
      await actor.updateProduct(
        productId,
        name ?? null,
        description ?? null,
        price ?? null,
        category ?? null,
        imageUrl ?? null
      );
      console.log(`[useUpdateProduct ${timestamp}] Product updated successfully`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      console.error('[useUpdateProduct] Error:', error);
      toast.error('Failed to update product');
    },
  });
}
