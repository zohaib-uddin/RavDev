import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, User, Menu, X, Search, ChevronDown, Shield } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const cart = useStore(state => state.cart);
  const wishlist = useStore(state => state.wishlist);
  const user = useStore(state => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  const categories = [
    { name: 'Co-Ord Sets', slug: 'co-ord-sets' },
    { name: 'Oversize Tees', slug: 'oversize-tees' },
    { name: 'Graphic Trousers', slug: 'graphic-trousers' },
    { name: 'Trackpants', slug: 'trackpants' },
    { name: 'Graphic Shorts', slug: 'graphic-shorts' },
    { name: 'Shirts & Jackets', slug: 'shirts' },
  ];

  return (
    <>
      <div className="bg-black text-white text-xs py-2.5 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex">
          <span className="mx-8">🔥 FREE SHIPPING ON ORDERS ABOVE Rs.3,000</span>
          <span className="mx-8">⚡ NEW DROPS EVERY WEEK</span>
          <span className="mx-8">💎 PREMIUM STREETWEAR</span>
          <span className="mx-8">🚚 CASH ON DELIVERY AVAILABLE</span>
          <span className="mx-8">↩️ 7-DAY EASY RETURNS</span>
          <span className="mx-8">🔥 FREE SHIPPING ON ORDERS ABOVE Rs.3,000</span>
          <span className="mx-8">⚡ NEW DROPS EVERY WEEK</span>
          <span className="mx-8">💎 PREMIUM STREETWEAR</span>
        </div>
      </div>

      <motion.nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl lg:text-3xl font-black tracking-tighter font-display">RAVENZA</h1>
            </Link>
            <div className="hidden lg:flex items-center space-x-8">
              <Link to="/" className="text-sm font-medium text-gray-800 hover:text-black transition-colors">HOME</Link>
              <div className="relative group">
                <button className="text-sm font-medium text-gray-800 hover:text-black transition-colors flex items-center gap-1">SHOP <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" /></button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-white shadow-2xl rounded-xl border py-4 min-w-[220px]">
                    {categories.map(cat => (<Link key={cat.slug} to={`/shop/${cat.slug}`} className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">{cat.name}</Link>))}
                    <hr className="my-2" />
                    <Link to="/shop" className="block px-5 py-2.5 text-sm font-bold text-black hover:bg-gray-50">View All →</Link>
                  </div>
                </div>
              </div>
              <Link to="/shop?new=true" className="text-sm font-medium text-gray-800 hover:text-black">NEW ARRIVALS</Link>
              <Link to="/about" className="text-sm font-medium text-gray-800 hover:text-black">ABOUT</Link>
              <Link to="/admin" className="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center gap-1" title="Admin: admin@ravenza.pk / admin123">
                <Shield size={14} /> ADMIN
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 hover:bg-gray-100 rounded-full"><Search size={20} /></button>
              <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full hidden sm:block"><User size={20} /></Link>
              <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full relative">
                <Heart size={20} />
                {wishlist.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{wishlist.length}</span>}
              </Link>
              <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full relative">
                <ShoppingBag size={20} />
                {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
              </Link>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t overflow-hidden bg-white">
              <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Search products..." className="w-full pl-12 pr-4 py-3.5 border-2 rounded-full focus:outline-none focus:border-black text-sm" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') { navigate('/shop'); setIsSearchOpen(false); } }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, x: -300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -300 }} className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-black font-display">RAVENZA</h2>
                  <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
                </div>
                <nav className="space-y-1">
                  <Link to="/" className="block text-lg font-medium py-3 border-b">Home</Link>
                  <Link to="/shop" className="block text-lg font-medium py-3 border-b">Shop All</Link>
                  {categories.map(cat => (<Link key={cat.slug} to={`/shop/${cat.slug}`} className="block text-base text-gray-600 py-2 pl-4">{cat.name}</Link>))}
                  <hr className="my-4" />
                  <Link to="/track-order" className="block text-lg font-medium py-3 border-b">Track Order</Link>
                  <Link to="/faq" className="block text-lg font-medium py-3 border-b">FAQ</Link>
                  <Link to="/contact" className="block text-lg font-medium py-3 border-b">Contact</Link>
                  <Link to="/size-guide" className="block text-lg font-medium py-3 border-b">Size Guide</Link>
                  <Link to="/about" className="block text-lg font-medium py-3 border-b">About</Link>
                  <hr className="my-4" />
                  {user ? (
                    <>
                      <Link to="/dashboard" className="block text-lg font-medium py-3 border-b">My Account</Link>
                      {user.role === 'admin' && <Link to="/admin" className="block text-lg font-medium py-3 text-purple-600 border-b"><Shield size={16} className="inline mr-2" /> Admin Panel</Link>}
                    </>
                  ) : (<Link to="/login" className="block text-lg font-medium py-3 border-b">Login / Register</Link>)}
                  <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                    <p className="text-xs font-bold text-purple-700 mb-1">ADMIN ACCESS</p>
                    <p className="text-xs text-purple-600">Email: admin@ravenza.pk</p>
                    <p className="text-xs text-purple-600">Password: admin123</p>
                    <Link to="/admin" className="text-xs font-bold text-purple-700 mt-2 inline-block underline">Go to Admin Panel →</Link>
                  </div>
                </nav>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
