import { useState, useMemo, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import { useGetAllProducts } from '../hooks/useQueries';

export default function ProductsPage() {
  const { data: products = [], isLoading, error, refetch } = useGetAllProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Debug logging
  useEffect(() => {
    console.log('[ProductsPage] Component rendered');
    console.log('[ProductsPage] isLoading:', isLoading);
    console.log('[ProductsPage] error:', error);
    console.log('[ProductsPage] products from hook:', products);
    console.log('[ProductsPage] products length:', products?.length ?? 0);
    
    if (products && products.length > 0) {
      console.log('[ProductsPage] First product:', products[0]);
      console.log('[ProductsPage] Product IDs:', products.map(p => p.id));
    }
  }, [products, isLoading, error]);

  // Map backend image URLs to local generated assets
  const productsWithLocalImages = useMemo(() => {
    console.log('[ProductsPage] Computing productsWithLocalImages...');
    
    if (!products || !Array.isArray(products)) {
      console.warn('[ProductsPage] Products is not an array:', products);
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
      const result = products.map((product) => {
        if (!product || typeof product !== 'object') {
          console.error('[ProductsPage] Invalid product:', product);
          return null;
        }
        
        return {
          ...product,
          imageUrl: imageMap[product.name] || product.imageUrl || '/assets/generated/swapan-store-logo.dim_200x200.png',
        };
      }).filter(Boolean);
      
      console.log('[ProductsPage] productsWithLocalImages result:', result);
      console.log('[ProductsPage] productsWithLocalImages length:', result.length);
      return result;
    } catch (err) {
      console.error('[ProductsPage] Error mapping products:', err);
      return [];
    }
  }, [products]);

  const categories = useMemo(() => {
    console.log('[ProductsPage] Computing categories...');
    
    if (!products || !Array.isArray(products)) {
      return ['All'];
    }

    try {
      const cats = new Set(products.map((p) => p?.category).filter(Boolean));
      const result = ['All', ...Array.from(cats)];
      console.log('[ProductsPage] categories:', result);
      return result;
    } catch (err) {
      console.error('[ProductsPage] Error computing categories:', err);
      return ['All'];
    }
  }, [products]);

  const filteredProducts = useMemo(() => {
    console.log('[ProductsPage] Computing filteredProducts...');
    console.log('[ProductsPage] Starting with productsWithLocalImages:', productsWithLocalImages.length);
    
    try {
      let filtered = productsWithLocalImages;

      // Filter by category
      if (selectedCategory !== 'All') {
        console.log('[ProductsPage] Filtering by category:', selectedCategory);
        filtered = filtered.filter((p) => p?.category === selectedCategory);
        console.log('[ProductsPage] After category filter:', filtered.length);
      }

      // Filter by search query
      if (searchQuery.trim() !== '') {
        console.log('[ProductsPage] Filtering by search query:', searchQuery);
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((p) => p?.name?.toLowerCase().includes(query));
        console.log('[ProductsPage] After search filter:', filtered.length);
      }

      console.log('[ProductsPage] Final filteredProducts:', filtered);
      console.log('[ProductsPage] Final filteredProducts length:', filtered.length);
      return filtered;
    } catch (err) {
      console.error('[ProductsPage] Error filtering products:', err);
      return [];
    }
  }, [productsWithLocalImages, selectedCategory, searchQuery]);

  if (isLoading) {
    console.log('[ProductsPage] Rendering loading state');
    return (
      <>
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (error) {
    console.error('[ProductsPage] Rendering error state:', error);
    return (
      <>
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="mx-auto max-w-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading products</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>Unable to load products from the store. This could be due to a network issue or a problem with the backend.</p>
              <p className="text-xs font-mono">
                {error instanceof Error ? error.message : 'Unknown error occurred'}
              </p>
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                size="sm"
                className="mt-2"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  console.log('[ProductsPage] Rendering main content');
  console.log('[ProductsPage] About to render', filteredProducts.length, 'products');

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="container mx-auto px-4 py-8">
        {/* Hero Banner */}
        <div className="mb-12 overflow-hidden rounded-2xl">
          <img
            src="/assets/generated/hero-banner.dim_1200x400.png"
            alt="Swapan Store - Indian Masalas and Groceries"
            className="h-48 w-full object-cover md:h-64 lg:h-80"
          />
        </div>

        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-foreground">Our Products</h1>
          <p className="text-lg text-muted-foreground">
            Authentic Indian masalas, premium groceries, and pure food oils
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex justify-center">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full max-w-2xl">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            {searchQuery.trim() !== '' ? (
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground">No products found</p>
                <p className="text-muted-foreground">
                  No products match your search "{searchQuery}". Try clearing the search or using different keywords.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground">No products available</p>
                <p className="text-muted-foreground">
                  {products.length === 0 
                    ? 'No products have been added to the store yet.' 
                    : 'No products found in this category.'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              if (!product || !product.id) {
                console.error('[ProductsPage] Invalid product in render:', product);
                return null;
              }
              
              console.log('[ProductsPage] Rendering ProductCard for:', product.name, 'id:', product.id);
              
              try {
                return <ProductCard key={String(product.id)} product={product} />;
              } catch (err) {
                console.error('[ProductsPage] Error rendering ProductCard:', err, 'product:', product);
                return null;
              }
            })}
          </div>
        )}
      </div>
    </>
  );
}
