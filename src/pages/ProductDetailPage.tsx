import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Zap, ChevronLeft, ChevronRight, Star, Check, Truck, Shield, RefreshCw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useCart } from '../context/CartContext';
import SizeGuideModal from '../components/SizeGuideModal';
import ProductCard from '../components/ProductCard';
import DOMPurify from 'dompurify';

export default function ProductDetailPage() {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const { products, fetchProducts } = useStore();
  const { addToCart } = useCart();
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, []);

  const product = products.find(p => p.slug === productSlug);

  // Auto-select first size and color
  useEffect(() => {
    if (product) {
      if (!selectedSize && product.sizes?.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      if (!selectedColor && product.colors?.length > 0) {
        const firstColor = typeof product.colors[0] === 'string' 
          ? product.colors[0] 
          : (product.colors[0] as any).name;
        setSelectedColor(firstColor);
      }
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <Link to="/shop" className="text-purple-600 hover:underline">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const images = product.images || [product.thumbnail_image || product.image || ''];
  const hasSizeGuide = product.size_guide || product.has_size_guide;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }

    const colorObj = typeof product.colors?.[0] === 'string' 
      ? { name: selectedColor, hex: '#000000' }
      : product.colors?.find((c: any) => c.name === selectedColor) || { name: selectedColor, hex: '#000000' };

    addToCart({
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        actual_price: product.actual_price || product.price || 0,
        thumbnail_image: product.thumbnail_image || product.image || '',
      },
      size: selectedSize,
      color: colorObj,
      quantity,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-black">Shop</Link>
          <span>/</span>
          <Link to={`/collections/${product.category}`} className="hover:text-black capitalize">
            {product.category?.replace('-', ' ')}
          </Link>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left Side - Images (Sticky) */}
          <div ref={imageContainerRef} className="lg:sticky lg:top-24 lg:self-start">
            {/* Main Image */}
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-4 group">
              <motion.img
                key={activeImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={images[activeImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Badge with Pulse Animation */}
              {(product.is_new_arrival || product.compare_price) && (
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 text-sm font-bold"
                >
                  {product.is_new_arrival ? 'NEW' : `${Math.round((1 - (product.actual_price || product.price || 0) / (product.compare_price || 1)) * 100)}% OFF`}
                </motion.div>
              )}

              {/* Navigation Arrows - Transparent Background */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={32} strokeWidth={1} className="text-black" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((activeImageIndex + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={32} strokeWidth={1} className="text-black" />
                  </button>
                </>
              )}
            </div>

            {/* Gallery Dots */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2 mb-4">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === activeImageIndex ? 'bg-black w-8' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Gallery Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === activeImageIndex ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Product Info */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                ))}
              </div>
              <span className="text-sm text-gray-600">(128 reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-bold">
                Rs. {(product.actual_price || product.price || 0).toLocaleString()}
              </span>
              {product.compare_price && (
                <span className="text-xl text-gray-400 line-through">
                  Rs. {product.compare_price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold mb-3">COLOR: <span className="font-normal text-gray-600">{selectedColor}</span></h3>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color: any, idx: number) => {
                    const colorName = typeof color === 'string' ? color : color.name;
                    const colorHex = typeof color === 'string' ? '#000000' : color.hex;
                    const isSelected = selectedColor === colorName;

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(colorName)}
                        className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-all ${
                          isSelected ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full border-2 ${isSelected ? 'border-black' : 'border-gray-300'}`}
                          style={{ backgroundColor: colorHex }}
                        >
                          {isSelected && (
                            <div className="w-full h-full flex items-center justify-center">
                              <Check size={16} className={colorHex === '#FFFFFF' ? 'text-black' : 'text-white'} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium">{colorName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold">SIZE</h3>
                  {hasSizeGuide && (
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="text-sm text-gray-600 underline hover:text-black"
                    >
                      Size Guide
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-14 h-14 border-2 rounded-lg text-sm font-medium transition-all ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="text-sm font-bold mb-3">QUANTITY</h3>
              <div className="flex items-center border-2 rounded-lg w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-50 transition-colors"
                >
                  -
                </button>
                <span className="px-6 font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                className="flex-1 border-2 border-black text-black py-4 rounded-lg font-bold hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} />
                ADD TO CART
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 border-2 border-black text-black py-4 rounded-lg font-bold hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <Zap size={20} />
                BUY NOW
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Truck size={24} className="mx-auto mb-2 text-gray-600" />
                <p className="text-xs font-medium">Free Shipping</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Shield size={24} className="mx-auto mb-2 text-gray-600" />
                <p className="text-xs font-medium">Secure Payment</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <RefreshCw size={24} className="mx-auto mb-2 text-gray-600" />
                <p className="text-xs font-medium">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Product Specifications</h2>
          
          <div className="space-y-4">
            {/* Fabric & Composition */}
            {product.fabric_composition && (
              <div className="border-b pb-4">
                <h3 className="font-bold mb-2">Fabric & Composition</h3>
                <div 
                  className="text-gray-700"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.fabric_composition) }}
                />
              </div>
            )}

            {/* Fit */}
            {product.fit && (
              <div className="border-b pb-4">
                <h3 className="font-bold mb-2">Fit</h3>
                <p className="text-gray-700">{product.fit}</p>
              </div>
            )}

            {/* Garment Care */}
            {product.garment_care && (
              <div className="border-b pb-4">
                <h3 className="font-bold mb-2">Garment Care</h3>
                <p className="text-gray-700">{product.garment_care}</p>
              </div>
            )}

            {/* More Specifications */}
            {product.more_specifications && (
              <div className="border-b pb-4">
                <h3 className="font-bold mb-2">More Specifications</h3>
                <div 
                  className="text-gray-700"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.more_specifications) }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={16} className={j < 5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-3">"Amazing quality! The fabric is so soft and the fit is perfect. Highly recommended!"</p>
                <p className="text-sm font-bold">Customer {i}</p>
                <p className="text-xs text-gray-500">Verified Buyer</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <SizeGuideModal
          isOpen={showSizeGuide}
          onClose={() => setShowSizeGuide(false)}
          sizeGuideData={product.size_guide}
          productName={product.name}
        />
      )}
    </div>
  );
}
