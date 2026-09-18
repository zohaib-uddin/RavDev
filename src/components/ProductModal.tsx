import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, ShoppingBag, Zap, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(
    typeof product?.colors?.[0] === 'string' 
      ? product?.colors?.[0] 
      : product?.colors?.[0]?.name || ''
  );
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const images = product.images || [product.thumbnail_image || product.image || ''];

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

    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold">Quick View</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-8 p-6">
          {/* Left Side - Images */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4 group">
              <motion.img
                key={activeImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={images[activeImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Navigation Arrows - Transparent */}
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

            {/* Gallery Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img: string, index: number) => (
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
            <h3 className="text-2xl font-bold mb-4">{product.name}</h3>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
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
            <p className="text-gray-700 mb-6">{product.description}</p>

            {/* Color Selection with Names */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-bold mb-3">
                  COLOR: <span className="font-normal text-gray-600">{selectedColor}</span>
                </h4>
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
                <h4 className="text-sm font-bold mb-3">SIZE</h4>
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
            <div className="mb-6">
              <h4 className="text-sm font-bold mb-3">QUANTITY</h4>
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
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 border-2 border-black text-black py-4 rounded-lg font-bold hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} />
                ADD TO CART
              </button>
              <button
                onClick={() => {
                  handleAddToCart();
                  onClose();
                  window.location.href = '/checkout';
                }}
                className="flex-1 border-2 border-black text-black py-4 rounded-lg font-bold hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <Zap size={20} />
                BUY NOW
              </button>
            </div>

            {/* Wishlist */}
            <button className="w-full border-2 border-gray-200 py-3 rounded-lg font-medium hover:border-black transition-colors flex items-center justify-center gap-2">
              <Heart size={20} />
              Add to Wishlist
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
