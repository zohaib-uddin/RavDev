import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  thumbnail_image: string;
  sub_category_name?: string;
}

interface MainCategory {
  id: string;
  name: string;
  slug: string;
  banner_image: string;
  description: string;
}

export default function CollectionsPage() {
  const { mainCategorySlug, subCategorySlug } = useParams();
  const [mainCategory, setMainCategory] = useState<MainCategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mainCategorySlug) {
      fetchCollectionData();
    }
  }, [mainCategorySlug, subCategorySlug]);

  const fetchCollectionData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/collections/${mainCategorySlug}`);
      const data = await response.json();
      setMainCategory(data.main_category);
      
      // Filter by sub-category if provided
      if (subCategorySlug) {
        const filtered = data.products.filter((p: Product) => 
          p.sub_category_name?.toLowerCase().replace(/\s+/g, '-') === subCategorySlug
        );
        setProducts(filtered);
      } else {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching collection:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!mainCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Collection not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative h-96">
        <img
          src={mainCategory.banner_image}
          alt={mainCategory.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">{mainCategory.name}</h1>
            <p className="text-xl">{mainCategory.description}</p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">
              {subCategorySlug ? subCategorySlug.replace(/-/g, ' ') : 'All Products'}
            </h2>
            <p className="text-gray-600">{products.length} products</p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-500">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/products/${product.slug}`} className="group block">
                    <div className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden mb-3">
                      <img
                        src={product.thumbnail_image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-black mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    <p className="text-lg font-bold text-gray-900">Rs. {product.price}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
