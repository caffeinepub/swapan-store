import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAdminAuth } from './useAdminAuth';
import type { Product, ProductId, Quantity, Order } from '../backend';

// Query to fetch all products
export function useGetAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

// Query to fetch cart contents
export function useGetCartContents() {
  const { actor, isFetching } = useActor();

  return useQuery<[Product, Quantity][]>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCartContents();
    },
    enabled: !!actor && !isFetching,
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
  const { actor, isFetching } = useActor();
  const { isAuthenticated } = useAdminAuth();

  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}
