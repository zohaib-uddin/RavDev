import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
import MegaMenu from './MegaMenu';

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
            <Link to="/cart" className="text-gray-700 hover:text-black relative">
              <ShoppingBag size={24} />
            </Link>

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
