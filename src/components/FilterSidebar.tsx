import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface FilterSidebarProps {
  onFilterChange: (filters: any) => void;
  availableFilters: {
    sizes: string[];
    colors: Array<{ name: string; hex: string; count: number }>;
    priceRange: { min: number; max: number };
    categories: Array<{ id: string; name: string; slug: string; count: number }>;
  };
}

export default function FilterSidebar({ onFilterChange, availableFilters }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    size: true,
    color: true,
    price: true,
    features: true,
    categories: true,
  });

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    availableFilters.priceRange.min,
    availableFilters.priceRange.max
  ]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleSize = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size];
    setSelectedSizes(newSizes);
    onFilterChange({ sizes: newSizes, colors: selectedColors, priceRange, features: selectedFeatures, category: selectedCategory });
  };

  const toggleColor = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    setSelectedColors(newColors);
    onFilterChange({ sizes: selectedSizes, colors: newColors, priceRange, features: selectedFeatures, category: selectedCategory });
  };

  const toggleFeature = (feature: string) => {
    const newFeatures = selectedFeatures.includes(feature)
      ? selectedFeatures.filter(f => f !== feature)
      : [...selectedFeatures, feature];
    setSelectedFeatures(newFeatures);
    onFilterChange({ sizes: selectedSizes, colors: selectedColors, priceRange, features: newFeatures, category: selectedCategory });
  };

  const handlePriceChange = (index: number, value: number) => {
    const newRange: [number, number] = [...priceRange];
    newRange[index] = value;
    setPriceRange(newRange);
    onFilterChange({ sizes: selectedSizes, colors: selectedColors, priceRange: newRange, features: selectedFeatures, category: selectedCategory });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onFilterChange({ sizes: selectedSizes, colors: selectedColors, priceRange, features: selectedFeatures, category });
  };

  const clearAllFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([availableFilters.priceRange.min, availableFilters.priceRange.max]);
    setSelectedFeatures([]);
    setSelectedCategory('all');
    onFilterChange({ sizes: [], colors: [], priceRange: [availableFilters.priceRange.min, availableFilters.priceRange.max], features: [], category: 'all' });
  };

  const hasActiveFilters = selectedSizes.length > 0 || selectedColors.length > 0 || 
    priceRange[0] !== availableFilters.priceRange.min || priceRange[1] !== availableFilters.priceRange.max ||
    selectedFeatures.length > 0 || selectedCategory !== 'all';

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 sticky top-20 h-fit max-h-[calc(100vh-5rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-black">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Size Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('size')}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-semibold text-black">Size</span>
          {expandedSections.size ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <AnimatePresence>
          {expandedSections.size && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2">
                {availableFilters.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2 text-sm font-medium border transition-all ${
                      selectedSizes.includes(size)
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Color Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('color')}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-semibold text-black">Color</span>
          {expandedSections.color ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <AnimatePresence>
          {expandedSections.color && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-3">
                {availableFilters.colors.map(color => (
                  <div key={color.name} className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => toggleColor(color.name)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColors.includes(color.name)
                          ? 'border-black border-4'
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                    <span className="text-xs text-gray-600">{color.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-semibold text-black">Price Range</span>
          {expandedSections.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 mb-1 block">Min</label>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 text-sm"
                      min={availableFilters.priceRange.min}
                      max={priceRange[1]}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 mb-1 block">Max</label>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 text-sm"
                      min={priceRange[0]}
                      max={availableFilters.priceRange.max}
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={availableFilters.priceRange.min}
                  max={availableFilters.priceRange.max}
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Features Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('features')}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-semibold text-black">Features</span>
          {expandedSections.features ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <AnimatePresence>
          {expandedSections.features && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.includes('new_arrivals')}
                    onChange={() => toggleFeature('new_arrivals')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-black">New Arrivals</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.includes('best_sellers')}
                    onChange={() => toggleFeature('best_sellers')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-black">Best Sellers</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.includes('on_sale')}
                    onChange={() => toggleFeature('on_sale')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-black">On Sale</span>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Categories Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-semibold text-black">Categories</span>
          {expandedSections.categories ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <AnimatePresence>
          {expandedSections.categories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === 'all'}
                    onChange={() => handleCategoryChange('all')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-black">All Categories</span>
                </label>
                {availableFilters.categories.map(category => (
                  <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category.slug}
                      onChange={() => handleCategoryChange(category.slug)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">{category.name}</span>
                    <span className="text-xs text-gray-500">({category.count})</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
