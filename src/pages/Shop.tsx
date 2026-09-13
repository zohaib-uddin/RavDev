import { useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Shop() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const { products } = useStore();
  const [sortBy, setSortBy] = useState('featured');
  const isNew = searchParams.get('new') === 'true';
  const categoryNames: Record<string, string> = { 'co-ord-sets': 'Co-Ord Sets', 'oversize-tees': 'Oversize Tees', 'graphic-trousers': 'Graphic Trousers', 'trackpants': 'Trackpants', 'graphic-shorts': 'Graphic Shorts', 'shirts': 'Shirts & Jackets' };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    if (category) filtered = filtered.filter(p => p.category === category);
    if (isNew) filtered = filtered.filter(p => p.isNew);
    switch (sortBy) {
      case 'price-low': filtered.sort((a, b) => ((a.salePrice || a.price || 0)) - ((b.salePrice || b.price || 0))); break;
      case 'price-high': filtered.sort((a, b) => ((b.salePrice || b.price || 0)) - ((a.salePrice || a.price || 0))); break;
      default: break;
    }
    return filtered;
  }, [products, category, isNew, sortBy]);

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-gray-900 to-black py-12 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs tracking-[0.3em] text-gray-400 mb-2">COLLECTION</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold">{isNew ? 'New Arrivals' : category ? categoryNames[category] || 'Shop' : 'All Products'}</h1>
            <p className="text-gray-400 mt-2">{filteredProducts.length} products</p>
          </motion.div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b">
          <span className="text-sm text-gray-500">{filteredProducts.length} products</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-2.5 border rounded-full text-sm font-medium bg-white">
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group">
              <Link to={`/product/${product.id}`} className="block">
                <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-gray-100">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {product.isNew && <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full">NEW</span>}
                  {product.salePrice && <span className="absolute top-12 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">SALE</span>}
                </div>
              </Link>
              <div className="mt-3">
                <Link to={`/product/${product.id}`}><h3 className="text-sm font-medium line-clamp-1">{product.name}</h3></Link>
                <div className="flex items-center gap-2 mt-1">
                  {product.salePrice ? (<><span className="text-sm font-bold">Rs.{product.salePrice.toLocaleString()}</span><span className="text-xs text-gray-400 line-through">Rs.{product.price?.toLocaleString()}</span></>) : (<span className="text-sm font-bold">Rs.{product.price?.toLocaleString()}</span>)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
