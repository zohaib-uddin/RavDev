import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About Us */}
          <div>
            <h3 className="font-bold text-black mb-4 text-sm uppercase tracking-wider">About Ravenza</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-600 hover:text-black text-sm transition-colors">Our Story</Link></li>
              <li><Link to="/careers" className="text-gray-600 hover:text-black text-sm transition-colors">Careers</Link></li>
              <li><Link to="/press" className="text-gray-600 hover:text-black text-sm transition-colors">Press</Link></li>
              <li><Link to="/sustainability" className="text-gray-600 hover:text-black text-sm transition-colors">Sustainability</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-black mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/shop" className="text-gray-600 hover:text-black text-sm transition-colors">Shop All</Link></li>
              <li><Link to="/collections" className="text-gray-600 hover:text-black text-sm transition-colors">Collections</Link></li>
              <li><Link to="/new-arrivals" className="text-gray-600 hover:text-black text-sm transition-colors">New Arrivals</Link></li>
              <li><Link to="/bestsellers" className="text-gray-600 hover:text-black text-sm transition-colors">Best Sellers</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-black mb-4 text-sm uppercase tracking-wider">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-gray-600 hover:text-black text-sm transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-black text-sm transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping" className="text-gray-600 hover:text-black text-sm transition-colors">Shipping Info</Link></li>
              <li><Link to="/returns" className="text-gray-600 hover:text-black text-sm transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/size-guide" className="text-gray-600 hover:text-black text-sm transition-colors">Size Guide</Link></li>
            </ul>
          </div>

          {/* Stay Connected */}
          <div>
            <h3 className="font-bold text-black mb-4 text-sm uppercase tracking-wider">Stay Connected</h3>
            <p className="text-gray-600 text-sm mb-4">Follow us on social media for latest updates</p>
            <div className="flex gap-4">
              {/* Facebook */}
              <a 
                href="https://facebook.com/ravenza" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                </svg>
              </a>

              {/* Instagram */}
              <a 
                href="https://instagram.com/ravenza" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="url(#instagram-gradient)"/>
                  <defs>
                    <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FD5949"/>
                      <stop offset="50%" stopColor="#D6249F"/>
                      <stop offset="100%" stopColor="#285AEB"/>
                    </linearGradient>
                  </defs>
                </svg>
              </a>

              {/* TikTok */}
              <a 
                href="https://tiktok.com/@ravenza" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.84-.1z" fill="#000000"/>
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.84-.1z" fill="url(#tiktok-gradient)" opacity="0.8"/>
                  <defs>
                    <linearGradient id="tiktok-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#25F4EE"/>
                      <stop offset="100%" stopColor="#FE2C55"/>
                    </linearGradient>
                  </defs>
                </svg>
              </a>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <h4 className="font-semibold text-black text-sm mb-2">Newsletter</h4>
              <p className="text-gray-600 text-xs mb-3">Subscribe for exclusive offers</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
                />
                <button className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © 2026 RAVENZA. POWERED BY RAVENZA™ GROUP
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-gray-600 hover:text-black transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-600 hover:text-black transition-colors">Terms of Service</Link>
              <Link to="/cookies" className="text-gray-600 hover:text-black transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
