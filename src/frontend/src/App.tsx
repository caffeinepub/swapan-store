import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import Header from './components/Header';
import Footer from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';

// Create root route with layout
const rootRoute = createRootRoute({
  component: () => {
    return (
      <div className="flex min-h-screen flex-col">
        <Outlet />
      </div>
    );
  },
});

// Products page route (renders its own header with search)
const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <ProductsPage />
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  ),
});

// Layout with header (no search) for other pages
const LayoutWithHeader = () => {
  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: LayoutWithHeader,
});

const cartRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/cart',
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/checkout',
  component: CheckoutPage,
});

const adminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/admin',
  component: AdminDashboard,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/admin/login',
  component: AdminLoginPage,
});

const routeTree = rootRoute.addChildren([
  productsRoute,
  layoutRoute.addChildren([cartRoute, checkoutRoute, adminRoute, adminLoginRoute]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
