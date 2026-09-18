import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2 } from 'lucide-react';

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    actual_price: number;
    thumbnail_image: string;
  };
  size: string;
  color: { name: string; hex: string };
  quantity: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  newItemId?: string | null; // For assembly animation
}

export default function CartSidebar({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemoveItem,
  newItemId 
}: CartSidebarProps) {
  const [animatingItems, setAnimatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (newItemId) {
      setAnimatingItems(prev => new Set([...prev, newItemId]));
      // Remove from animating set after animation completes
      setTimeout(() => {
        setAnimatingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(newItemId);
          return newSet;
        });
      }, 600); // Total assembly animation duration
    }
  }, [newItemId]);

  const subtotal = items.reduce((sum, item) => sum + (item.product.actual_price * item.quantity), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Shopping Cart</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item) => {
                      const isAnimating = animatingItems.has(item.id);
                      
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={isAnimating ? { opacity: 0, x: 50 } : false}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          transition={{ duration: 0.3 }}
                          className="flex gap-4 p-4 border border-gray-200 rounded-lg"
                        >
                          {/* Product Image - Step 1 */}
                          <motion.div
                            initial={isAnimating ? { opacity: 0, x: -20 } : false}
                            animate={isAnimating ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: isAnimating ? 0 : 0, duration: 0.2 }}
                            className="w-20 h-24 flex-shrink-0"
                          >
                            <img
                              src={item.product.thumbnail_image}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </motion.div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            {/* Title - Step 2 */}
                            <motion.h3
                              initial={isAnimating ? { opacity: 0, y: 10 } : false}
                              animate={isAnimating ? { opacity: 1, y: 0 } : {}}
                              transition={{ delay: isAnimating ? 0.1 : 0, duration: 0.2 }}
                              className="font-medium text-sm mb-2 line-clamp-2"
                            >
                              {item.product.name}
                            </motion.h3>

                            {/* Size & Color Badges - Step 3 */}
                            <motion.div
                              initial={isAnimating ? { scale: 0 } : false}
                              animate={isAnimating ? { scale: 1 } : {}}
                              transition={{ 
                                delay: isAnimating ? 0.2 : 0, 
                                duration: 0.2,
                                type: 'spring',
                                stiffness: 300
                              }}
                              className="flex gap-2 mb-2"
                            >
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                Size: {item.size}
                              </span>
                              <span 
                                className="text-xs px-2 py-1 rounded flex items-center gap-1"
                                style={{ 
                                  backgroundColor: item.color.hex,
                                  color: item.color.hex === '#FFFFFF' || item.color.hex === '#F5F5DC' ? '#000' : '#FFF'
                                }}
                              >
                                {item.color.name}
                              </span>
                            </motion.div>

                            {/* Quantity & Price - Step 4 */}
                            <motion.div
                              initial={isAnimating ? { opacity: 0, y: 10 } : false}
                              animate={isAnimating ? { opacity: 1, y: 0 } : {}}
                              transition={{ delay: isAnimating ? 0.3 : 0, duration: 0.2 }}
                              className="flex items-center justify-between"
                            >
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2 border border-gray-300 rounded">
                                <button
                                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Minus size={14} />
                                </button>
                                <motion.span
                                  key={item.quantity}
                                  initial={{ scale: 1.3 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 300 }}
                                  className="px-2 text-sm font-medium"
                                >
                                  {item.quantity}
                                </motion.span>
                                <button
                                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 hover:bg-gray-100"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>

                              {/* Price */}
                              <p className="font-bold text-sm">
                                Rs. {(item.product.actual_price * item.quantity).toLocaleString()}
                              </p>
                            </motion.div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-2 hover:bg-red-50 rounded transition-colors self-start"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-6 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <button className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
