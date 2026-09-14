import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, RefreshCw, Award, Zap, Instagram, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore, Product } from '../store/useStore';

const heroSlides = [
  { id: 1, subtitle: 'WINTER ESSENTIALS 2024', title: 'SHADOW\nREALM', description: 'Premium co-ord sets crafted for those who dare to stand out.', cta: 'SHOP CO-ORD SETS', link: '/shop/co-ord-sets', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop' },
  { id: 2, subtitle: 'NEW DROP ALERT', title: 'ACID\nWASH', description: 'Authentic vintage washes with premium softness.', cta: 'EXPLORE TEES', link: '/shop/oversize-tees', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop' },
  { id: 3, subtitle: 'STREETWEAR CULTURE', title: 'WIDE\nLEG', description: 'Signature graphic trousers with contemporary details.', cta: 'SHOP TROUSERS', link: '/shop/graphic-trousers', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&h=1080&fit=crop' },
  { id: 4, subtitle: 'LIMITED EDITION', title: 'REAPER\nX', description: 'Bold reaper graphics on premium cotton. Limited stock.', cta: 'GRAB YOURS', link: '/shop/co-ord-sets', image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1920&h=1080&fit=crop' },
  { id: 5, subtitle: 'ESSENTIALS COLLECTION', title: 'TRACK\nPANTS', description: 'Premium fabric trackpants with relaxed wide-leg fit.', cta: 'SHOP TRACKPANTS', link: '/shop/trackpants', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=1080&fit=crop' },
];

export default function Home() {
  const { products, reviews, categories, fetchProducts, fetchCategories } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Fetch data from API on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);
  
  const featuredProducts = products.filter(p => p.isFeatured);
  const newProducts = products.filter(p => p.isNew);
  const bestsellers = products.filter(p => p.isBestseller);

  // Category images mapping (fallback images for each category)
  const getCategoryImage = (slug: string, coverUrl: string | null) => {
    if (coverUrl) return coverUrl;
    const images: Record<string, string> = {
      'co-ord-sets': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=700&fit=crop',
      'graphic-shorts': 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=700&fit=crop',
      'graphic-trousers': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=700&fit=crop',
      'oversize-tees': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=700&fit=crop',
      'trackpants': 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=700&fit=crop',
      'shirts': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=700&fit=crop',
    };
    return images[slug] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=700&fit=crop';
  };

  return (
    <div>
      {/* Hero Carousel */}
      <section className="relative h-[90vh] overflow-hidden bg-black">
        {heroSlides.map((slide, i) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <img src={slide.image} alt="" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          </div>
        ))}
        <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
            <p className="text-white/70 text-sm tracking-[0.3em] mb-4">{heroSlides[currentSlide].subtitle}</p>
            <h1 className="text-6xl md:text-8xl font-black text-white font-display leading-[0.9] whitespace-pre-line">{heroSlides[currentSlide].title}</h1>
            <p className="text-white/70 mt-4 text-lg">{heroSlides[currentSlide].description}</p>
            <div className="mt-8 flex gap-4">
              <Link to={heroSlides[currentSlide].link} className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 font-bold text-sm hover:bg-gray-200 rounded-full">{heroSlides[currentSlide].cta} <ArrowRight size={18} /></Link>
              <Link to="/shop" className="inline-flex items-center gap-2 border-2 border-white/40 text-white px-8 py-4 font-bold text-sm hover:bg-white/10 rounded-full">VIEW ALL</Link>
            </div>
          </motion.div>
        </div>
        <button onClick={() => setCurrentSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20"><ChevronLeft size={24} /></button>
        <button onClick={() => setCurrentSlide((currentSlide + 1) % heroSlides.length)} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20"><ChevronRight size={24} /></button>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {heroSlides.map((_, i) => (<button key={i} onClick={() => setCurrentSlide(i)} className={`transition-all duration-300 rounded-full ${i === currentSlide ? 'w-10 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`} />))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] text-gray-500 mb-2">EXPLORE</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold">SHOP BY CATEGORY</h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div key={cat.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Link to={`/shop/${cat.slug}`} className="group block">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-3">
                  <img src={getCategoryImage(cat.slug, cat.cover_image_url)} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h3 className="text-sm font-semibold text-center group-hover:text-purple-600">{cat.name}</h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <div><p className="text-xs tracking-[0.3em] text-gray-500 mb-1">MOST POPULAR</p><h2 className="text-3xl font-display font-bold">TRENDING NOW</h2></div>
          <Link to="/shop" className="text-sm font-semibold flex items-center gap-1">View All <ArrowRight size={16} /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.slice(0, 8).map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group">
              <Link to={`/product/${product.id}`} className="block">
                <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-gray-100">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {product.isNew && <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full">NEW</span>}
                  {product.salePrice && <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full" style={{ top: product.isNew ? '2.5rem' : '0.75rem' }}>SALE</span>}
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
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[{ icon: Truck, title: 'Free Shipping', desc: 'Above Rs.3,000' }, { icon: Shield, title: 'Secure Payment', desc: '100% Protected' }, { icon: RefreshCw, title: 'Easy Returns', desc: '7-Day Policy' }, { icon: Award, title: 'Premium Quality', desc: 'Handpicked Fabrics' }].map((f, i) => (
              <div key={i} className="text-center p-6 bg-white rounded-2xl">
                <f.icon className="mx-auto mb-3 text-gray-700" size={28} />
                <h4 className="font-bold text-sm">{f.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold">TRUSTED BY THOUSANDS</h2>
            <div className="flex items-center justify-center gap-1 mt-3">
              {[...Array(5)].map((_, i) => <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />)}
              <span className="text-sm text-gray-500 ml-2">4.9/5 from 2,000+ reviews</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((review, i) => (
              <div key={review.id} className="bg-white p-6 rounded-2xl border hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-1 mb-3">{[...Array(review.rating)].map((_, j) => <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />)}</div>
                <p className="text-gray-600 text-sm mb-4">"{review.comment}"</p>
                <p className="text-xs font-semibold">{review.user_name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Zap className="mx-auto mb-4 text-purple-400" size={28} />
          <h2 className="text-2xl font-display font-bold mb-3">JOIN THE RAVENZA FAMILY</h2>
          <p className="text-gray-400 mb-6">Get early access to drops & 10% off your first order.</p>
          <div className="flex max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 px-5 py-3.5 bg-white/10 border border-white/20 rounded-l-full focus:outline-none text-sm" />
            <button className="px-6 py-3.5 bg-white text-black font-bold rounded-r-full text-sm">SUBSCRIBE</button>
          </div>
        </div>
      </section>
    </div>
  );
}
