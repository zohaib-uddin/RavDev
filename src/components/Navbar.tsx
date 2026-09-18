import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, Heart, Shield, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [scrollY, setScrollY] = useState(0);
  const triggerRef = useRef<HTMLDivElement>(null);
  const cartIconRef = useRef<HTMLDivElement>(null);
  const { items, openCart } = useCart();
  const navigate = useNavigate();
  
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchMainCategories();
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  // Dynamic logo size based on scroll
  const logoSize = scrollY > 100 ? 'text-3xl' : 'text-5xl';

  return (
    <>
      <nav className={`bg-white sticky top-0 z-40 transition-all duration-300 ${scrollY > 100 ? 'shadow-lg' : 'shadow-md'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className={`flex justify-between items-center transition-all duration-300 ${scrollY > 100 ? 'h-16' : 'h-20'}`}>
            {/* Left Side - Search Icon */}
            <button 
              onClick={() => navigate('/search')}
              className="text-gray-700 hover:text-black transition-colors"
            >
              <Search size={24} />
            </button>

            {/* Center - Logo with Dynamic Size */}
            <Link to="/" className={`font-bold text-black transition-all duration-300 ${logoSize}`}>
              RAVENZA
            </Link>

            {/* Right Side Icons - Order: Admin, Profile, Wishlist, Cart */}
            <div className="flex items-center gap-3">
              {/* Admin Icon - Only show if admin */}
              {isAdmin && (
                <Link to="/admin/dashboard" className="text-gray-700 hover:text-black transition-colors">
                  <Shield size={24} />
                </Link>
              )}
              
              {/* Profile Icon */}
              <Link to={user ? '/dashboard' : '/login'} className="text-gray-700 hover:text-black transition-colors">
                <User size={24} />
              </Link>
              
              {/* Wishlist Icon */}
              <Link to="/wishlist" className="text-gray-700 hover:text-black transition-colors relative">
                <Heart size={24} />
              </Link>
              
              {/* Cart Icon */}
              <div ref={cartIconRef} data-cart-icon className="relative">
                <button
                  onClick={openCart}
                  className="text-gray-700 hover:text-black transition-colors relative"
                >
                  <motion.div
                    key={cartCount}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    <ShoppingBag size={24} />
                  </motion.div>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
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

          {/* Desktop Menu - Categories */}
          <div className="hidden md:flex items-center justify-center gap-8 py-3 border-t">
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
                  className="text-gray-700 hover:text-black font-medium transition-colors text-sm"
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
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {mainCategories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/collections/${category.slug}`}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
