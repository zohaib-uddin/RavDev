import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Minus, Plus, ShoppingCart } from 'lucide-react';

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

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product, size: string, color: string, quantity: number) => void;
}

export default function ProductCard({ product, onQuickView, onAddToCart }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const [quantity, setQuantity] = useState(1);
  const [isQuickViewExpanded, setIsQuickViewExpanded] = useState(false);

  // Calculate discount percentage
  const calculateDiscount = () => {
    if (product.compare_price && product.actual_price) {
      const discount = ((product.compare_price - product.actual_price) / product.compare_price) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  // Determine badge to show
  const getBadge = () => {
    // Priority: Admin badge > Auto-calculated discount
    if (product.badge_text) {
      return product.badge_text;
    }
    
    const discount = calculateDiscount();
    if (discount > 0) {
      return `${discount}% OFF`;
    }
    
    return null;
  };

  const badge = getBadge();

  const handleAddToCart = () => {
    if (onAddToCart && selectedSize && selectedColor) {
      onAddToCart(product, selectedSize, selectedColor, quantity);
    }
  };

  const handleQuantityChange = (type: 'increment' | 'decrement') => {
    if (type === 'increment') {
      setQuantity(Math.min(quantity + 1, product.stock || 99));
    } else {
      setQuantity(Math.max(quantity - 1, 1));
    }
  };

  return (
    <div className="group relative bg-white">
      {/* Image Section - 9:16 aspect ratio */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '9/16' }}>
        <img
          src={product.thumbnail_image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Badge - Top Right with Pulse Animation */}
        {badge && (
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1.5 text-xs font-bold"
          >
            {badge}
          </motion.div>
        )}

        {/* Quick View Button - Center */}
        <motion.button
          onMouseEnter={() => setIsQuickViewExpanded(true)}
          onMouseLeave={() => setIsQuickViewExpanded(false)}
          onClick={() => onQuickView?.(product)}
          animate={{
            width: isQuickViewExpanded ? '160px' : '48px',
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-black flex items-center justify-center gap-2 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ height: '48px', borderRadius: isQuickViewExpanded ? '24px' : '50%' }}
        >
          <Eye size={20} className="text-black flex-shrink-0" />
          {isQuickViewExpanded && (
            <span className="text-black text-sm font-medium whitespace-nowrap">
              Quick View
            </span>
          )}
        </motion.button>

        {/* Size Selector - Slide Up on Hover */}
        {product.sizes && product.sizes.length > 0 && (
          <motion.div
            initial={{ y: '100%' }}
            whileHover={{ y: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-white p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <p className="text-xs text-gray-600 mb-2">Select Size</p>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1.5 text-xs font-medium border transition-all ${
                    selectedSize === size
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-300 hover:border-black'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Quantity Selector - Below Image */}
      <div className="flex items-center border border-gray-200 bg-white" style={{ height: '52px' }}>
        <button
          onClick={() => handleQuantityChange('decrement')}
          disabled={quantity <= 1}
          className="flex-1 h-full flex items-center justify-center text-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus size={16} />
        </button>
        <div className="flex-1 h-full flex items-center justify-center text-black font-medium border-x border-gray-200">
          {quantity}
        </div>
        <button
          onClick={() => handleQuantityChange('increment')}
          disabled={quantity >= (product.stock || 99)}
          className="flex-1 h-full flex items-center justify-center text-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={!selectedSize || !selectedColor}
        className="w-full bg-black text-white py-3.5 flex items-center justify-center gap-2 font-semibold text-sm hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        style={{ height: '52px' }}
      >
        <ShoppingCart size={18} />
        ADD TO CART
      </button>

      {/* Product Info */}
      <div className="p-3 text-center">
        {/* Product Name */}
        <h3 className="text-sm font-medium text-black mb-2 line-clamp-2 uppercase">
          {product.name}
        </h3>

        {/* Prices */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-bold text-black">
            Rs. {product.actual_price.toLocaleString()}
          </span>
          {product.compare_price && (
            <span className="text-sm text-gray-500 line-through">
              Rs. {product.compare_price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
