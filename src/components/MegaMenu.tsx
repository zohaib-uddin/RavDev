import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  thumbnail_image: string;
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  product_count: number;
  products: Product[];
}

interface MainCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  banner_image: string;
}

interface MegaMenuProps {
  mainCategorySlug: string;
  isVisible: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLDivElement>;
}

export default function MegaMenu({ mainCategorySlug, isVisible, onClose, triggerRef }: MegaMenuProps) {
  const [menuData, setMenuData] = useState<{
    main_category: MainCategory | null;
    sub_categories: SubCategory[];
  }>({ main_category: null, sub_categories: [] });
  
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch mega menu data
  useEffect(() => {
    if (isVisible && mainCategorySlug) {
      fetchMegaMenuData();
    }
  }, [isVisible, mainCategorySlug]);

  const fetchMegaMenuData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/mega-menu/${mainCategorySlug}`);
      const data = await response.json();
      setMenuData(data);
    } catch (error) {
      console.error('Error fetching mega menu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle mouse enter/leave with delay
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      onClose();
    }, 500); // 0.5s delay
  };

  // Calculate position dynamically
  const getPosition = () => {
    if (!triggerRef.current) return { top: 0, left: 0 };
    
    const rect = triggerRef.current.getBoundingClientRect();
    return {
      top: rect.bottom,
      left: rect.left
    };
  };

  const position = getPosition();

  if (loading) {
    return (
      <div className="fixed bg-white shadow-2xl rounded-lg p-8 z-50" style={{ top: position.top, left: position.left, width: '1200px' }}>
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!menuData.main_category) return null;

  const { main_category, sub_categories } = menuData;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="fixed bg-white shadow-2xl rounded-lg z-50 overflow-hidden"
          style={{ 
            top: position.top, 
            left: position.left, 
            width: '1200px',
            maxHeight: '600px'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="grid grid-cols-12 h-full">
            {/* Left Side - Sub Categories (25%) */}
            <div className="col-span-3 bg-gray-50 p-6 overflow-y-auto">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Categories</h3>
              <div className="space-y-2">
                {sub_categories.map((subCat) => (
                  <Link
                    key={subCat.id}
                    to={`/collections/${main_category.slug}/${subCat.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white transition-colors group"
                    onClick={onClose}
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-black">
                      {subCat.name}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                      {subCat.product_count}
                    </span>
                  </Link>
                ))}
              </div>
              
              {/* View All Button */}
              <Link
                to={`/collections/${main_category.slug}`}
                className="mt-6 block text-center bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                onClick={onClose}
              >
                View All →
              </Link>
            </div>

            {/* Middle - Featured Products (50%) */}
            <div className="col-span-5 p-6 overflow-y-auto">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Featured Products</h3>
              
              {sub_categories.map((subCat) => (
                subCat.products.length > 0 && (
                  <div key={subCat.id} className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-600 mb-3">{subCat.name}</h4>
                    <div className="relative">
                      <div className="grid grid-cols-3 gap-3">
                        {subCat.products.slice(currentSlide * 3, (currentSlide * 3) + 3).map((product) => (
                          <Link
                            key={product.id}
                            to={`/products/${product.slug}`}
                            className="group"
                            onClick={onClose}
                          >
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2">
                              <img
                                src={product.thumbnail_image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <h5 className="text-xs font-medium text-gray-800 line-clamp-2 group-hover:text-black">
                              {product.name}
                            </h5>
                            <p className="text-xs font-bold text-gray-900 mt-1">
                              Rs. {product.price}
                            </p>
                          </Link>
                        ))}
                      </div>
                      
                      {/* Carousel Arrows */}
                      {subCat.products.length > 3 && (
                        <>
                          <button
                            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white shadow-lg rounded-full p-1 hover:bg-gray-100"
                            disabled={currentSlide === 0}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={() => setCurrentSlide(Math.min(Math.ceil(subCat.products.length / 3) - 1, currentSlide + 1))}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white shadow-lg rounded-full p-1 hover:bg-gray-100"
                            disabled={currentSlide >= Math.ceil(subCat.products.length / 3) - 1}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              ))}
            </div>

            {/* Right Side - Category Info (25%) */}
            <div className="col-span-4 relative overflow-hidden">
              {/* Background Image */}
              {main_category.banner_image && (
                <div className="absolute inset-0">
                  <img
                    src={main_category.banner_image}
                    alt={main_category.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-black/40"></div>
                </div>
              )}
              
              {/* Content */}
              <div className="relative z-10 p-6 h-full flex flex-col justify-end text-white">
                {main_category.description && (
                  <p className="text-xs uppercase tracking-wider mb-2 text-white/80">
                    {main_category.description}
                  </p>
                )}
                <h2 className="text-2xl font-bold mb-3">{main_category.name}</h2>
                <Link
                  to={`/collections/${main_category.slug}`}
                  className="inline-block bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  onClick={onClose}
                >
                  Explore Collection
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
