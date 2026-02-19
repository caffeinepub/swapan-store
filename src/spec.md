# Specification

## Summary
**Goal:** Fix the cart removal functionality so users can successfully remove items from their shopping cart.

**Planned changes:**
- Debug and fix the backend removeFromCart function to properly remove products from the user's cart
- Fix the useRemoveFromCart React Query mutation hook to correctly call the backend and invalidate the cart cache
- Ensure the Remove button in CartPage properly triggers the mutation with the correct product ID

**User-visible outcome:** Users can click the Remove button on cart items and see them immediately removed from their cart, with proper loading states and success feedback.
