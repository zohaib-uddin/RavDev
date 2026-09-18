import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizeGuideData: any;
  productName: string;
}

export default function SizeGuideModal({ isOpen, onClose, sizeGuideData, productName }: SizeGuideModalProps) {
  if (!isOpen || !sizeGuideData) return null;

  const getCategoryData = (category: string) => {
    const sizeGuides: any = {
      'oversized_tees': {
        title: 'Oversized Tees',
        columns: ['Size', 'Chest', 'Length', 'Sleeve'],
        rows: [
          ['S', '42"', '28"', '9"'],
          ['M', '44"', '29"', '9.5"'],
          ['L', '46"', '30"', '10"'],
          ['XL', '48"', '31"', '10.5"'],
          ['2XL', '50"', '32"', '11"'],
        ]
      },
      'shirts': {
        title: 'Shirts',
        columns: ['Size', 'Chest', 'Length', 'Sleeve'],
        rows: [
          ['S', '38"', '27"', '24"'],
          ['M', '40"', '28"', '24.5"'],
          ['L', '42"', '29"', '25"'],
          ['XL', '44"', '30"', '25.5"'],
          ['2XL', '46"', '31"', '26"'],
        ]
      },
      'shorts': {
        title: 'Shorts',
        columns: ['Size', 'Waist', 'Length', 'Inseam'],
        rows: [
          ['S', '28-30"', '18"', '8"'],
          ['M', '30-32"', '19"', '8.5"'],
          ['L', '32-34"', '20"', '9"'],
          ['XL', '34-36"', '21"', '9.5"'],
          ['2XL', '36-38"', '22"', '10"'],
        ]
      },
      'jackets': {
        title: 'Jackets',
        columns: ['Size', 'Chest', 'Length', 'Sleeve'],
        rows: [
          ['S', '40"', '26"', '25"'],
          ['M', '42"', '27"', '25.5"'],
          ['L', '44"', '28"', '26"'],
          ['XL', '46"', '29"', '26.5"'],
          ['2XL', '48"', '30"', '27"'],
        ]
      },
      'bottoms': {
        title: 'Bottoms',
        columns: ['Size', 'Waist', 'Hip', 'Length'],
        rows: [
          ['S', '28-30"', '36-38"', '40"'],
          ['M', '30-32"', '38-40"', '41"'],
          ['L', '32-34"', '40-42"', '42"'],
          ['XL', '34-36"', '42-44"', '43"'],
          ['2XL', '36-38"', '44-46"', '44"'],
        ]
      },
      'hoodies': {
        title: 'Oversized Hoodies/Sweatshirts',
        columns: ['Size', 'Chest', 'Length', 'Sleeve'],
        rows: [
          ['S', '44"', '27"', '24"'],
          ['M', '46"', '28"', '24.5"'],
          ['L', '48"', '29"', '25"'],
          ['XL', '50"', '30"', '25.5"'],
          ['2XL', '52"', '31"', '26"'],
        ]
      }
    };
    return sizeGuides[category] || sizeGuides['oversized_tees'];
  };

  const categoryData = getCategoryData(sizeGuideData.category || 'oversized_tees');

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
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Size Guide</h2>
            <p className="text-sm text-gray-600 mt-1">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Brand Info */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold mb-2">RAVENZA</h3>
            <p className="text-sm text-gray-600 mb-1">Pakistan's Emerging Unisex Clothing Brand</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">SIZE GUIDE - USE THIS GUIDE TO CHOOSE THE RIGHT SIZE</p>
          </div>

          {/* Size Chart Table */}
          <div className="mb-8">
            <h4 className="text-lg font-bold mb-4">{categoryData.title}</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-black text-white">
                    {categoryData.columns.map((col: string, idx: number) => (
                      <th key={idx} className="p-3 text-left text-sm font-semibold">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categoryData.rows.map((row: string[], rowIdx: number) => (
                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      {row.map((cell: string, cellIdx: number) => (
                        <td key={cellIdx} className="p-3 text-sm border-b border-gray-200">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* How to Measure */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-bold mb-4">How to Measure</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="font-semibold mb-1">Chest:</p>
                <p>Measure around the fullest part of your chest, keeping the tape horizontal.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Length:</p>
                <p>Measure from the highest point of the shoulder to the desired hem length.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Waist:</p>
                <p>Measure around your natural waistline, just above the belly button.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Sleeve:</p>
                <p>Measure from the shoulder seam to the wrist.</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="text-lg font-bold mb-3">Pro Tips</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• If you're between sizes, we recommend sizing up for a more comfortable fit</li>
              <li>• All measurements are in inches</li>
              <li>• Allow 1-2 cm tolerance for manual measurements</li>
              <li>• Our oversized fits are designed to be 1-2 sizes larger than regular fit</li>
              <li>• When in doubt, check product reviews for fit feedback from other customers</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
