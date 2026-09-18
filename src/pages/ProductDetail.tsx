import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  thumbnail_image: string;
  main_category_name?: string;
  sub_category_name?: string;
  is_featured: boolean;
}

export default function ProductDetail() {
  const { productSlug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productSlug) {
      fetchProduct();
    }
  }, [productSlug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/products`);
      const data = await response.json();
      const found = data.find((p: Product) => p.slug === productSlug);
      setProduct(found);
    } catch (error) {
      console.error('Error fetching product:', error);
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

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.thumbnail_image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">
                {product.main_category_name} / {product.sub_category_name}
              </p>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-gray-900 mb-6">Rs. {product.price}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {product.is_featured && (
              <div className="mb-6">
                <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                  Featured Product
                </span>
              </div>
            )}

            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Select Size</h3>
              <div className="flex gap-3">
                {['S', 'M', 'L', 'XL'].map((size) => (
                  <button
                    key={size}
                    className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:border-black transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Select Color</h3>
              <div className="flex gap-3">
                {['Black', 'White', 'Gray'].map((color) => (
                  <button
                    key={color}
                    className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:border-black transition-colors"
                  >
                    <div className={`w-full h-full rounded-lg ${
                      color === 'Black' ? 'bg-black' :
                      color === 'White' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-auto">
              <button className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                <ShoppingBag size={20} />
                Add to Cart
              </button>
              <button className="px-6 py-4 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors">
                <Heart size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
