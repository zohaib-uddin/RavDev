import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import FilterSidebar from '../components/collection/FilterSidebar';
import QuickViewModal from '../components/collection/QuickViewModal';
import { Product } from '../store/useStore';

export default function CollectionPage() {
  const { categorySlug } = useParams();
  const { products, categories, fetchProducts } = useStore();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState({
    sizes: [] as string[],
    colors: [] as string[],
    priceRange: [0, 10000] as [number, number],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (categorySlug && products.length > 0) {
      // Filter products by category
      let filtered = products.filter(p => p.category === categorySlug);

      // Apply additional filters
      if (filters.sizes.length > 0) {
        filtered = filtered.filter(p => 
          filters.sizes.some(size => p.sizes?.includes(size) || p.attributes?.sizes?.includes(size))
        );
      }

      if (filters.colors.length > 0) {
        filtered = filtered.filter(p => 
          filters.colors.some(color => p.colors?.includes(color) || p.attributes?.colors?.includes(color))
        );
      }

      filtered = filtered.filter(p => {
        const price = p.salePrice || p.price || 0;
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });

      setFilteredProducts(filtered);
    }
  }, [categorySlug, products, filters]);

  const category = categories.find(c => c.slug === categorySlug);
  const subcategories = categories.filter(c => c.parent_id === category?.id);

  // Get available sizes and colors for filters
  const availableSizes = Array.from(
    new Set(
      filteredProducts.flatMap(p => p.sizes || p.attributes?.sizes || [])
    )
  ).sort();

  const availableColors = Array.from(
    new Set(
      filteredProducts.flatMap(p => p.colors || p.attributes?.colors || [])
    )
  ).sort();

  const priceRange = {
    min: Math.min(...filteredProducts.map(p => p.salePrice || p.price || 0)),
    max: Math.max(...filteredProducts.map(p => p.salePrice || p.price || 0)),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative h-[40vh] overflow-hidden bg-black">
        <img
          src={category?.cover_image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop'}
          alt={category?.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
                {category?.name}
              </h1>
              <p className="text-white/80 text-lg">{category?.description}</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Subcategory Navigation */}
      {subcategories.length > 0 && (
        <div className="bg-white border-b sticky top-16 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex gap-4 overflow-x-auto">
              <Link
                to={`/shop/${categorySlug}`}
                className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium whitespace-nowrap"
              >
                All
              </Link>
              {subcategories.map(sub => (
                <Link
                  key={sub.slug}
                  to={`/shop/${sub.slug}`}
                  className="px-4 py-2 border rounded-full text-sm font-medium whitespace-nowrap hover:bg-black hover:text-white transition-colors"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar
              onFilterChange={setFilters}
              availableSizes={availableSizes}
              availableColors={availableColors}
              priceRange={priceRange}
            />
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                {filteredProducts.length} products
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group"
                  >
                    <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-gray-100 mb-3">
                      <Link to={`/product/${product.id}`}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      {product.isNew && (
                        <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full">
                          NEW
                        </span>
                      )}
                      {product.salePrice && (
                        <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                          SALE
                        </span>
                      )}
                      {/* Quick View Button */}
                      <button
                        onClick={() => setQuickViewProduct(product)}
                        className="absolute bottom-3 left-3 right-3 bg-white text-black py-2 rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Quick View
                      </button>
                    </div>
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-sm font-medium line-clamp-1 hover:text-purple-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      {product.salePrice ? (
                        <>
                          <span className="text-sm font-bold">
                            Rs. {product.salePrice.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            Rs. {product.price?.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold">
                          Rs. {product.price?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
