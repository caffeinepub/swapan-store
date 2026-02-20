import { useState, useMemo, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import { useGetAllProducts } from '../hooks/useQueries';

export default function ProductsPage() {
  const { data: products = [], isLoading, error, refetch, isFetching } = useGetAllProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Debug logging - Component render
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.group(`[ProductsPage ${timestamp}] Component Render`);
    console.log(`[ProductsPage ${timestamp}] Render state:`, {
      isLoading,
      isFetching,
      hasError: !!error,
      productsCount: products?.length ?? 0,
      selectedCategory,
      searchQuery,
    });
    console.log(`[ProductsPage ${timestamp}] Products from hook:`, products);
    
    if (error) {
      console.error(`[ProductsPage ${timestamp}] Error object:`, error);
    }
    
    if (products && products.length > 0) {
      console.log(`[ProductsPage ${timestamp}] First product:`, products[0]);
      console.log(`[ProductsPage ${timestamp}] All product IDs:`, products.map(p => p.id));
      console.log(`[ProductsPage ${timestamp}] All product names:`, products.map(p => p.name));
    } else {
      console.warn(`[ProductsPage ${timestamp}] No products available to display`);
    }
    console.groupEnd();
  }, [products, isLoading, isFetching, error, selectedCategory, searchQuery]);

  // Map backend image URLs to local generated assets
  const productsWithLocalImages = useMemo(() => {
    const timestamp = new Date().toISOString();
    console.group(`[ProductsPage ${timestamp}] Image Mapping`);
    console.log(`[ProductsPage ${timestamp}] Input products:`, products);
    
    if (!products || !Array.isArray(products)) {
      console.warn(`[ProductsPage ${timestamp}] Products is not an array:`, products);
      console.groupEnd();
      return [];
    }

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

    try {
      const result = products.map((product, index) => {
        if (!product || typeof product !== 'object') {
          console.error(`[ProductsPage ${timestamp}] Invalid product at index ${index}:`, product);
          return null;
        }
        
        const mappedImage = imageMap[product.name] || product.imageUrl || '/assets/generated/swapan-store-logo.dim_200x200.png';
        
        if (index < 3) { // Log first 3 mappings
          console.log(`[ProductsPage ${timestamp}] Mapping product "${product.name}":`, {
            originalImage: product.imageUrl,
            mappedImage: mappedImage
          });
        }
        
        return {
          ...product,
          imageUrl: mappedImage,
        };
      }).filter((p): p is NonNullable<typeof p> => p !== null);
      
      console.log(`[ProductsPage ${timestamp}] Mapped ${result.length} products with local images`);
      console.groupEnd();
      return result;
    } catch (err) {
      console.error(`[ProductsPage ${timestamp}] Error mapping products:`, err);
      console.groupEnd();
      return [];
    }
  }, [products]);

  const categories = useMemo(() => {
    if (!products || !Array.isArray(products)) {
      return ['All'];
    }

    try {
      const cats = new Set(products.map((p) => p?.category).filter(Boolean));
      return ['All', ...Array.from(cats)];
    } catch (err) {
      console.error('[ProductsPage] Error computing categories:', err);
      return ['All'];
    }
  }, [products]);

  const filteredProducts = useMemo(() => {
    const timestamp = new Date().toISOString();
    console.group(`[ProductsPage ${timestamp}] Product Filtering`);
    console.log(`[ProductsPage ${timestamp}] Input:`, {
      productsCount: productsWithLocalImages.length,
      selectedCategory,
      searchQuery,
    });
    
    try {
      let filtered = productsWithLocalImages;

      // Filter by category
      if (selectedCategory !== 'All') {
        const beforeCount = filtered.length;
        filtered = filtered.filter((p) => p?.category === selectedCategory);
        console.log(`[ProductsPage ${timestamp}] Category filter: ${beforeCount} → ${filtered.length}`);
      }

      // Filter by search query
      if (searchQuery.trim() !== '') {
        const beforeCount = filtered.length;
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((p) => p?.name?.toLowerCase().includes(query));
        console.log(`[ProductsPage ${timestamp}] Search filter: ${beforeCount} → ${filtered.length}`);
      }

      console.log(`[ProductsPage ${timestamp}] Final filtered products: ${filtered.length}`);
      if (filtered.length > 0) {
        console.log(`[ProductsPage ${timestamp}] Sample filtered products:`, filtered.slice(0, 3).map(p => ({ id: p.id, name: p.name })));
      }
      console.groupEnd();
      return filtered;
    } catch (err) {
      console.error('[ProductsPage] Error filtering products:', err);
      console.groupEnd();
      return [];
    }
  }, [productsWithLocalImages, selectedCategory, searchQuery]);

  // Log when filtered products change
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`[ProductsPage ${timestamp}] Filtered products updated:`, {
      count: filteredProducts.length,
      products: filteredProducts.map(p => ({ id: p.id, name: p.name })),
    });
  }, [filteredProducts]);

  const handleRetry = () => {
    console.log('[ProductsPage] Manual retry triggered');
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Hero Banner */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-r from-primary/20 to-accent/20">
        <img
          src="/assets/generated/hero-banner.dim_1200x400.png"
          alt="Swapan Store"
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="text-center text-white">
            <h1 className="mb-2 text-4xl font-bold md:text-5xl">Welcome to Swapan Store</h1>
            <p className="text-lg md:text-xl">Authentic Indian Groceries & Spices</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="px-6">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Products</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>Failed to load products from the backend. This could be due to:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Network connectivity issues</li>
                <li>Backend canister not responding</li>
                <li>Actor initialization failure</li>
              </ul>
              <p className="mt-2 text-sm">
                Error details: {error instanceof Error ? error.message : 'Unknown error'}
              </p>
              <Button onClick={handleRetry} variant="outline" size="sm" className="mt-2">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State - No Products */}
        {!isLoading && !error && products.length === 0 && (
          <Alert className="mx-auto max-w-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Products Available</AlertTitle>
            <AlertDescription>
              <p className="mb-2">The store currently has no products in the database.</p>
              <p className="text-sm text-muted-foreground">
                If you're an admin, you can add products from the Admin Dashboard.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State - No Filtered Results */}
        {!isLoading && !error && products.length > 0 && filteredProducts.length === 0 && (
          <Alert className="mx-auto max-w-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Products Found</AlertTitle>
            <AlertDescription>
              <p>No products match your current filters.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try changing the category or search query.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Products Grid */}
        {!isLoading && !error && filteredProducts.length > 0 && (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                console.log('[ProductsPage] Rendering ProductCard for:', product.name, 'ID:', product.id);
                return <ProductCard key={String(product.id)} product={product} />;
              })}
            </div>
          </>
        )}

        {/* Fetching Indicator */}
        {isFetching && !isLoading && (
          <div className="mt-4 flex items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Refreshing products...
          </div>
        )}
      </main>
    </div>
  );
}
