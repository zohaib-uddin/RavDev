import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import SortingBar from '../components/SortingBar';

interface Product {
  id: string;
  name: string;
  slug: string;
  actual_price: number;
  compare_price?: number;
  thumbnail_image: string;
  images?: string[];
  sizes?: string[];
  colors?: Array<{ name: string; hex: string }>;
  badge_type?: string;
  badge_text?: string;
  is_new_arrival?: boolean;
  is_best_seller?: boolean;
  is_featured?: boolean;
  stock?: number;
}

export default function ShopAllPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridView, setGridView] = useState<4 | 6>(6);
  const [filters, setFilters] = useState({
    sizes: [] as string[],
    colors: [] as string[],
    priceRange: [0, 10000] as [number, number],
    features: [] as string[],
    category: 'all',
  });
  const [sort, setSort] = useState('featured');
  const [availability, setAvailability] = useState('all');

  const [availableFilters, setAvailableFilters] = useState({
    sizes: [] as string[],
    colors: [] as Array<{ name: string; hex: string; count: number }>,
    priceRange: { min: 0, max: 10000 },
    categories: [] as Array<{ id: string; name: string; slug: string; count: number }>,
  });

  useEffect(() => {
    fetchProducts();
    fetchAvailableFilters();
  }, [filters, sort, availability]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.sizes.length > 0) {
        params.append('sizes', filters.sizes.join(','));
      }
      if (filters.colors.length > 0) {
        params.append('colors', filters.colors.join(','));
      }
      params.append('min_price', filters.priceRange[0].toString());
      params.append('max_price', filters.priceRange[1].toString());
      if (filters.features.length > 0) {
        params.append('features', filters.features.join(','));
      }
      if (filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (availability !== 'all') {
        params.append('availability', availability);
      }
      params.append('sort', sort);

      const response = await fetch(`http://localhost:3001/api/products/shop-all?${params}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableFilters = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/filters/available');
      const data = await response.json();
      setAvailableFilters(data);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const handleQuickView = (product: Product) => {
    console.log('Quick view:', product);
    // Implement quick view modal
  };

  const handleAddToCart = (product: Product, size: string, color: string, quantity: number) => {
    console.log('Add to cart:', { product, size, color, quantity });
    // Implement add to cart logic with animation
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Carousel */}
      <section className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0 flex animate-scroll">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-full h-full relative"
              style={{ animationDuration: '20s' }}
            >
              <img
                src={`https://images.unsplash.com/photo-${
                  i === 1 ? '1441986300917-64674bd600d8' :
                  i === 2 ? '1558618666-fcd25c85f82e' :
                  i === 3 ? '1523398002811-999ca8dec234' :
                  '1445205170230-053b83016050'
                }?w=1920&h=500&fit=crop`}
                alt={`Hero ${i}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="text-5xl font-bold mb-4">Shop All Collections</h2>
                  <p className="text-xl">Discover our complete range</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <div className="flex">
        {/* Filter Sidebar - Left Side */}
        <FilterSidebar
          onFilterChange={setFilters}
          availableFilters={availableFilters}
        />

        {/* Products Section - Right Side */}
        <div className="flex-1">
          {/* Sorting Bar */}
          <SortingBar
            totalItems={products.length}
            onSortChange={setSort}
            onAvailabilityChange={setAvailability}
            onGridViewChange={setGridView}
            currentGridView={gridView}
          />

          {/* Products Grid */}
          <div className="p-6">
            {loading ? (
              <div className="grid grid-cols-6 gap-1">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200" style={{ aspectRatio: '9/16' }}></div>
                    <div className="h-12 bg-gray-200 mt-1"></div>
                    <div className="h-12 bg-gray-200"></div>
                    <div className="h-16 bg-gray-200 mt-2"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-gray-500">No products found</p>
                <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <div className={`grid gap-1 ${
                gridView === 6 
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
                  : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              }`}>
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard
                      product={product}
                      onQuickView={handleQuickView}
                      onAddToCart={handleAddToCart}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
