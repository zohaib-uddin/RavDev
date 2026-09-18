import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
import { motion } from 'framer-motion';
import MegaMenu from './MegaMenu';
import { useCart } from '../context/CartContext';

interface MainCategory {
  id: string;
  name: string;
  slug: string;
}

export default function Navbar() {
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const cartIconRef = useRef<HTMLDivElement>(null);
  const { items, openCart } = useCart();
  
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    fetchMainCategories();
  }, []);

  const fetchMainCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/categories?type=main');
      const data = await response.json();
      setMainCategories(data);
    } catch (error) {
      console.error('Error fetching main categories:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-black">
            RAVENZA
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {mainCategories.map((category) => (
              <div
                key={category.id}
                ref={hoveredCategory === category.slug ? triggerRef : null}
                className="relative"
                onMouseEnter={() => setHoveredCategory(category.slug)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link
                  to={`/collections/${category.slug}`}
                  className="text-gray-700 hover:text-black font-medium transition-colors"
                >
                  {category.name}
                </Link>

                {/* Mega Menu */}
                {hoveredCategory === category.slug && (
                  <MegaMenu
                    mainCategorySlug={category.slug}
                    isVisible={true}
                    onClose={() => setHoveredCategory(null)}
                    triggerRef={triggerRef}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="text-gray-700 hover:text-black">
              <User size={24} />
            </Link>
            <div ref={cartIconRef} data-cart-icon className="relative">
              <button
                onClick={openCart}
                className="text-gray-700 hover:text-black relative"
              >
                <motion.div
                  key={cartCount}
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <ShoppingBag size={24} />
                </motion.div>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: [0, 1.3, 1],
                    }}
                    transition={{ duration: 0.4, type: 'spring' }}
                    className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {mainCategories.map((category) => (
              <Link
                key={category.id}
                to={`/collections/${category.slug}`}
                className="block py-2 text-gray-700 hover:text-black"
                onClick={() => setMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
