import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface CollectionCard {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  display_order_in_focus: number;
}

// Skeleton Card Component
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
      <div className="bg-gray-200" style={{ aspectRatio: '4/5' }}></div>
      <div className="p-5">
        <div className="h-5 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-3"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export default function CollectionsInFocusSection() {
  const [collections, setCollections] = useState<CollectionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/collections-in-focus');
      
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }
      
      const data = await response.json();
      setCollections(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching collections:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate button text automatically
  const generateButtonText = (categoryName: string) => {
    return `Shop ${categoryName}`;
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left Column - Static Content */}
          <div className="flex flex-col justify-center">
            {/* Static Image */}
            <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=1000&fit=crop"
                alt="Collections in Focus"
                className="w-full h-auto object-cover"
                loading="eager"
              />
            </div>

            {/* Text Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
                Collections in Focus
              </h2>
              <p className="text-base text-gray-600 mb-4">
                Our most-loved collections, all in one place
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Ravenza brings together contemporary design, premium fabrics, and refined 
                craftsmanship in collections made for today's streetwear culture. From everyday 
                essentials to statement pieces, discover styles created to stand out with 
                effortless confidence.
              </p>
            </div>
          </div>

          {/* Right Column - Dynamic Cards Grid */}
          <div className="flex items-center">
            {loading ? (
              // Loading State - Show 4 skeleton cards
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : error ? (
              // Error State
              <div className="w-full text-center py-12">
                <p className="text-gray-500 mb-4">Unable to load collections</p>
                <button
                  onClick={fetchCollections}
                  className="px-6 py-2 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : collections.length === 0 ? (
              // Empty State
              <div className="w-full text-center py-12">
                <p className="text-gray-500">No collections available</p>
              </div>
            ) : (
              // Cards Grid - 2x2
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                {collections.map((collection, index) => (
                  <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Link
                      to={`/collections/${collection.slug}`}
                      className="block group"
                    >
                      {/* Card Container */}
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        
                        {/* Image Section (70-75% of card) */}
                        <div className="relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
                          <img
                            src={collection.image}
                            alt={collection.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>

                        {/* Content Section (25-30% of card) */}
                        <div className="p-5">
                          {/* Card Title */}
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                            {collection.name}
                          </h3>

                          {/* Card Description */}
                          <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
                            {collection.description}
                          </p>

                          {/* Button - Auto-generated text */}
                          <button className="w-full bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-700 transition-all duration-300 hover:scale-105">
                            {generateButtonText(collection.name)}
                          </button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
