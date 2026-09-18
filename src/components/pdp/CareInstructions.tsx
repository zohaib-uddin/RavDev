import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ChevronDown, ChevronUp, Shirt, Hand, Droplets, Wind } from 'lucide-react';

// Care Instructions Component
export function CareInstructions() {
  const careItems = [
    {
      icon: Shirt,
      title: 'No Iron on Print',
      description: 'Avoid direct ironing on printed areas'
    },
    {
      icon: Hand,
      title: 'Hand Wash Only',
      description: 'Gently hand wash in cold water'
    },
    {
      icon: Droplets,
      title: 'Use Mild Detergent',
      description: 'Use gentle, pH-neutral detergent'
    },
    {
      icon: Wind,
      title: 'Dry Inside Out',
      description: 'Turn garment inside out before drying'
    }
  ];

  return (
    <div className="bg-gray-50 rounded-xl p-8">
      <h3 className="text-2xl font-bold text-black mb-6 text-center">Care Instructions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {careItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-3 shadow-sm">
              <item.icon size={32} className="text-black" strokeWidth={1.5} />
            </div>
            <h4 className="font-semibold text-black text-sm mb-1">{item.title}</h4>
            <p className="text-xs text-gray-600">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Need Help Section Component
export function NeedHelpSection() {
  return (
    <div className="bg-black text-white rounded-xl p-8 text-center">
      <h3 className="text-3xl font-bold mb-3 uppercase tracking-wide">Need Help? We're Here.</h3>
      <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
        Questions about your order, sizing, delivery or anything else? Our support team is just a message away.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors">
          ONLINE SUPPORT
        </button>
        <a
          href="https://wa.me/923001234567?text=Hello%20Ravenza%20Support"
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-3 bg-[#25D366] text-white font-semibold rounded-full hover:bg-[#20BA5C] transition-colors flex items-center justify-center gap-2"
        >
          CHAT WITH US ON WHATSAPP
          <MessageCircle size={18} />
        </a>
      </div>
    </div>
  );
}

// FAQ Accordion Component
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'Is there any discount on online payment?',
      answer: 'Yes. We offer a 10% discount on online payments, capped at Rs. 500'
    },
    {
      question: 'Do you offer Cash on Delivery (COD)?',
      answer: 'Yes. Cash on Delivery (COD) is available across Pakistan.'
    },
    {
      question: 'When will I receive my order?',
      answer: 'Orders are usually delivered within:\n• 3–5 working days for major cities\n• 4–8 working days for other areas\nDelivery times may vary slightly depending on the destination and courier service.'
    },
    {
      question: 'What is your return and exchange policy?',
      answer: 'We offer Return & Exchange on eligible regular products. For complete details, please refer to our Return & Exchange Policy.\n\nPlease note: Products listed under the MINOR OR LAST collection are final sale and are strictly non-returnable and non-exchangeable.'
    },
    {
      question: 'What are the shipping or delivery charges?',
      answer: 'The standard delivery charge is Rs. 260, at a flat rate across Pakistan.'
    },
    {
      question: 'How will I know that my order is confirmed?',
      answer: 'Once your order is placed, our Customer Support Team will contact you via phone call or WhatsApp to confirm your order details.\n\nYour order will be processed after confirmation.'
    },
    {
      question: 'What is the MINOR OR LAST collection?',
      answer: 'MINOR OR LAST is a special collection featuring selected Monkeez products offered at 40%–80% off their original price.\n\nThe collection includes:\n\n• Minor Fault / Imperfect Products: Items that may have minor cosmetic or manufacturing imperfections such as small holes, rafoo marks, spots, stitching irregularities, loose threads, print imperfections, or other minor finishing issues.\n\n• Last Pieces / Old Collection: Products with no manufacturing fault that are discounted because they are the last few remaining pieces, old stock, discontinued styles, or from previous collections that are no longer actively listed on our website.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white rounded-xl p-8">
      <h3 className="text-2xl font-bold text-black mb-6">Frequently Asked Questions</h3>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-200">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors px-2"
            >
              <span className="font-semibold text-black text-sm">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp size={20} className="text-black flex-shrink-0" />
              ) : (
                <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
              )}
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="pb-4 text-gray-600 text-sm whitespace-pre-line px-2">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sticky Bottom Product Card Component
interface StickyBottomCardProps {
  product: any;
  selectedSize: string;
  onAddToCart: () => void;
}

export function StickyBottomCard({ product, selectedSize, onAddToCart }: StickyBottomCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show card after scrolling past the main image section
      const scrollPosition = window.scrollY;
      const showThreshold = 600; // Adjust based on your layout
      
      setIsVisible(scrollPosition > showThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50"
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              {/* Product Image */}
              <div className="w-20 h-20 flex-shrink-0">
                <img
                  src={product.thumbnail_image || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-black text-sm truncate">{product.name}</h4>
                {selectedSize && (
                  <p className="text-xs text-gray-600 mt-1">Size: {selectedSize}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {product.compare_price && (
                    <span className="text-xs text-gray-400 line-through">
                      Rs. {product.compare_price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-lg font-bold text-black">
                    Rs. {(product.actual_price || product.price || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={onAddToCart}
                className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
