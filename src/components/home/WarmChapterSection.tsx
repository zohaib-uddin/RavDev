import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface WarmChapter {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  image_url: string;
  product_ids?: string[];
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function WarmChapterSection() {
  const [chapters, setChapters] = useState<WarmChapter[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchWarmChapters();
  }, []);

  const fetchWarmChapters = async () => {
    try {
      console.log('🔄 Fetching warm chapters...');
      const response = await fetch('http://localhost:3001/api/warm-chapters');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Received ${data.length} warm chapters`);
      setChapters(data);
    } catch (error) {
      console.error('❌ Error fetching warm chapters:', error);
      // Fallback to empty array on error
      setChapters([]);
    }
  };

  // Auto-scroll logic
  useEffect(() => {
    if (chapters.length === 0 || isPaused) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % chapters.length);
    }, 4000); // 4 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [chapters.length, isPaused]);

  // Pause on tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  if (chapters.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500">Loading collections...</p>
        </div>
      </section>
    );
  }

  // Calculate visible cards (4 cards visible at a time)
  const visibleCards = [];
  for (let i = 0; i < 4; i++) {
    const index = (currentIndex + i) % chapters.length;
    visibleCards.push(chapters[index]);
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-medium text-gray-900 uppercase tracking-wide mb-4">
            WARM CHAPTER I
          </h2>
          <div className="w-64 h-0.5 bg-red-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 uppercase tracking-wider">
            NEW EDIT
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {visibleCards.map((chapter, index) => (
              <motion.div
                key={`${chapter.id}-${currentIndex}-${index}`}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: 'easeInOut', delay: index * 0.1 }}
              >
                <Link
                  to={`/collections/${chapter.slug}`}
                  className="block group"
                >
                  {/* Card */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-xl">
                    {/* Image Container */}
                    <div className="relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
                      <img
                        src={chapter.image_url}
                        alt={chapter.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 origin-left"
                        loading={index < 4 ? 'eager' : 'lazy'}
                      />
                    </div>

                    {/* Title */}
                    <div className="py-3 px-4 text-center">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                        {chapter.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center items-center gap-2 mt-10">
          {chapters.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`transition-all duration-300 ease-in-out rounded-full ${
                  isActive
                    ? 'w-6 h-2 bg-gray-900'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
