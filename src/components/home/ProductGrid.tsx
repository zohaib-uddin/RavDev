import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface ProductGridProps {
  title: string;
  subtitle: string;
  filterFn: (p: any) => boolean;
  link: string;
}

export default function ProductGrid({ title, subtitle, filterFn, link }: ProductGridProps) {
  const { products } = useStore();
  const filteredProducts = products.filter(filterFn).slice(0, 8);

  if (filteredProducts.length === 0) return null;

  return (
    <section className="py-16 max-w-7xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex justify-between items-center mb-10"
      >
        <div>
          <p className="text-xs tracking-[0.3em] text-gray-500 mb-1">{subtitle}</p>
          <h2 className="text-3xl font-display font-bold">{title}</h2>
        </div>
        <Link to={link} className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
          View All <ArrowRight size={16} />
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filteredProducts.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group"
          >
            <Link to={`/product/${product.id}`} className="block">
              <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.isNew && (
                  <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    NEW
                  </span>
                )}
                {product.salePrice && (
                  <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    SALE
                  </span>
                )}
                {product.badge && !product.isNew && !product.salePrice && (
                  <span className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    {product.badge}
                  </span>
                )}
              </div>
            </Link>
            <div className="mt-3">
              <Link to={`/product/${product.id}`}>
                <h3 className="text-sm font-medium line-clamp-1 hover:text-purple-600 transition-colors">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center gap-2 mt-1">
                {product.salePrice ? (
                  <>
                    <span className="text-sm font-bold">Rs.{product.salePrice.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 line-through">
                      Rs.{product.price?.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-bold">Rs.{product.price?.toLocaleString()}</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
