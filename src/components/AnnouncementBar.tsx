import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const announcements = [
  "🎉 10% OFF on Online Payment",
  "🔥 50% OFF on Selected Items",
  "🚚 Free Shipping on Orders Above Rs. 5000",
  "✨ New Collection Launch - Shop Now",
  "💎 Exclusive Member Discounts Available",
];

export default function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-50 border-b relative overflow-hidden"
          style={{ height: '48px' }}
        >
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-center relative">
            {/* Left Arrow */}
            <button
              onClick={prevSlide}
              className="absolute left-4 text-gray-700 hover:text-black transition-colors z-10"
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>

            {/* Announcement Text */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center text-sm text-gray-800 font-medium"
              >
                {announcements[currentIndex]}
              </motion.div>
            </AnimatePresence>

            {/* Right Arrow */}
            <button
              onClick={nextSlide}
              className="absolute right-4 text-gray-700 hover:text-black transition-colors z-10"
            >
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
