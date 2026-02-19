# Specification

## Summary
**Goal:** Add checkout flow with address and phone number collection, and display orders in admin dashboard.

**Planned changes:**
- Create Order data type in backend to store customer phone, address, items, total, timestamp, and Principal
- Implement backend function to create orders from cart items and clear cart after placement
- Add backend query to retrieve all orders for admin
- Create checkout page at /checkout with phone and address input fields
- Display order confirmation message "Your order will be delivered today!" after successful checkout
- Add "Proceed to Checkout" button to cart page
- Add Orders section to admin dashboard showing all customer orders with details
- Create React Query hooks for placing orders and fetching orders

**User-visible outcome:** Customers can proceed from cart to checkout, enter their phone number and delivery address, place orders, and see a delivery confirmation. Admins can view all customer orders with full details in the dashboard.
