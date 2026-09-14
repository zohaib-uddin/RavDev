import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Truck, Shield, RefreshCw, Star, ChevronRight, Minus, Plus, ChevronLeft, Check } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function ProductDetail() {
  const { id } = useParams();
  const { products, addToCart, wishlist, toggleWishlist, reviews, fetchProducts } = useStore();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const product = products.find(p => p.id === id);
  const productReviews = reviews.filter(r => r.product_id === id);
  const relatedProducts = products.filter(p => p.category === product?.category && p.id !== id).slice(0, 4);

  if (!product) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold mb-2">Product Not Found</h2><Link to="/shop" className="text-purple-600 hover:underline">Back to Shop</Link></div></div>;

  const isWishlisted = wishlist.includes(product.id);
  const handleAddToCart = () => {
    if (!selectedSize) return;
    for (let i = 0; i < quantity; i++) addToCart(product, selectedSize, selectedColor || product.colors?.[0] || 'Black');
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-black">Home</Link><ChevronRight size={14} />
          <Link to="/shop" className="hover:text-black">Shop</Link><ChevronRight size={14} />
          <span className="text-black">{product.name}</span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 group">
              <img src={product.images?.[activeImage] || product.image} alt={product.name} className="w-full h-full object-cover" />
              {product.images && product.images.length > 1 && (<>
                <button onClick={() => setActiveImage((activeImage - 1 + product.images.length) % product.images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"><ChevronLeft size={20} /></button>
                <button onClick={() => setActiveImage((activeImage + 1) % product.images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"><ChevronRight size={20} /></button>
              </>)}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && <span className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full">NEW</span>}
                {product.isBestseller && <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">BESTSELLER</span>}
              </div>
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (<button key={i} onClick={() => setActiveImage(i)} className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-black scale-105' : 'border-transparent opacity-60'}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>))}
              </div>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />)}</div>
              <span className="text-sm text-gray-500">({productReviews.length} reviews)</span>
            </div>
            <div className="flex items-center gap-3 mt-4">
              {product.salePrice ? (<><span className="text-3xl font-bold">Rs.{product.salePrice.toLocaleString()}</span><span className="text-lg text-gray-400 line-through">Rs.{product.price?.toLocaleString()}</span></>) : (<span className="text-3xl font-bold">Rs.{product.price?.toLocaleString()}</span>)}
            </div>
            <p className="text-gray-600 mt-4">{product.description}</p>
            <div className="mt-6">
              <h4 className="font-bold text-sm mb-3">COLOR: {selectedColor || product.colors?.[0]}</h4>
              <div className="flex gap-2">{product.colors?.map(color => (<button key={color} onClick={() => setSelectedColor(color)} className={`px-4 py-2.5 border rounded-xl text-sm font-medium ${(selectedColor || product.colors?.[0]) === color ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'}`}>{color}</button>))}</div>
            </div>
            <div className="mt-6">
              <h4 className="font-bold text-sm mb-3">SIZE</h4>
              <div className="flex flex-wrap gap-2">{product.sizes?.map(size => (<button key={size} onClick={() => setSelectedSize(size)} className={`w-12 h-12 border-2 rounded-xl text-sm font-medium ${selectedSize === size ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'}`}>{size}</button>))}</div>
              {!selectedSize && <p className="text-xs text-red-500 mt-2">Please select a size</p>}
            </div>
            <div className="mt-6">
              <h4 className="font-bold text-sm mb-3">QUANTITY</h4>
              <div className="flex items-center border-2 rounded-xl w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3"><Minus size={16} /></button>
                <span className="px-6 font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3"><Plus size={16} /></button>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddToCart} disabled={!selectedSize} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-bold text-sm ${addedToCart ? 'bg-green-500 text-white' : selectedSize ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                {addedToCart ? <><Check size={18} /> ADDED ✓</> : <><ShoppingBag size={18} /> ADD TO BAG</>}
              </motion.button>
              <button onClick={() => toggleWishlist(product.id)} className={`p-4 border-2 rounded-full ${isWishlisted ? 'border-red-500 text-red-500' : 'border-gray-200 hover:border-black'}`}><Heart size={20} className={isWishlisted ? 'fill-current' : ''} /></button>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[{ icon: Truck, text: 'Free Shipping' }, { icon: Shield, text: 'Secure Pay' }, { icon: RefreshCw, text: 'Easy Returns' }].map((f, i) => (<div key={i} className="text-center p-3 bg-gray-50 rounded-xl"><f.icon size={18} className="mx-auto mb-1 text-gray-600" /><span className="text-xs text-gray-600">{f.text}</span></div>))}
            </div>
            {product.details && product.details.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h4 className="font-bold mb-3">PRODUCT DETAILS</h4>
                <ul className="space-y-2">{product.details.map((d, i) => (<li key={i} className="text-sm text-gray-600 flex items-center gap-2"><Check size={14} className="text-green-500" />{d}</li>))}</ul>
              </div>
            )}
          </motion.div>
        </div>
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t pt-12">
            <h3 className="text-2xl font-display font-bold mb-8">You May Also Like</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map(p => (<Link key={p.id} to={`/product/${p.id}`} className="group"><div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100"><img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div><h4 className="text-sm font-medium mt-2 line-clamp-1">{p.name}</h4><p className="text-sm font-bold">Rs.{(p.salePrice || p.price || 0).toLocaleString()}</p></Link>))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
