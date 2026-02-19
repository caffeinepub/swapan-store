import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCard from '../components/ProductCard';
import { useGetAllProducts } from '../hooks/useQueries';

export default function ProductsPage() {
  const { data: products = [], isLoading } = useGetAllProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['All', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return productsWithLocalImages;
    return productsWithLocalImages.filter((p) => p.category === selectedCategory);
  }, [productsWithLocalImages, selectedCategory]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
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
          <p className="text-lg text-muted-foreground">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={Number(product.id)} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
