import { useState } from 'react';
import { ChevronDown, Grid3x3, Grid2x2 } from 'lucide-react';

interface SortingBarProps {
  totalItems: number;
  onSortChange: (sort: string) => void;
  onAvailabilityChange: (availability: string) => void;
  onGridViewChange: (columns: 4 | 6) => void;
  currentGridView: 4 | 6;
}

export default function SortingBar({ 
  totalItems, 
  onSortChange, 
  onAvailabilityChange, 
  onGridViewChange,
  currentGridView 
}: SortingBarProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showAvailabilityDropdown, setShowAvailabilityDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState('featured');
  const [selectedAvailability, setSelectedAvailability] = useState('all');

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'relevant', label: 'Most Relevant' },
    { value: 'best_selling', label: 'Best Selling' },
    { value: 'az', label: 'Alphabetically, A to Z' },
    { value: 'za', label: 'Alphabetically, Z to A' },
    { value: 'price_asc', label: 'Price, low to high' },
    { value: 'price_desc', label: 'Price, high to low' },
    { value: 'date_asc', label: 'Date, old to new' },
    { value: 'date_desc', label: 'Date, new to old' },
  ];

  const availabilityOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
  ];

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    onSortChange(sort);
    setShowSortDropdown(false);
  };

  const handleAvailabilityChange = (availability: string) => {
    setSelectedAvailability(availability);
    onAvailabilityChange(availability);
    setShowAvailabilityDropdown(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Left Side - Dropdowns */}
      <div className="flex items-center gap-6">
        {/* Availability Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAvailabilityDropdown(!showAvailabilityDropdown)}
            className="flex items-center gap-2 text-sm font-medium text-black hover:text-gray-700"
          >
            Availability
            <ChevronDown size={16} className={`transition-transform ${showAvailabilityDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showAvailabilityDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-lg py-2 min-w-[200px] z-10">
              {availabilityOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleAvailabilityChange(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    selectedAvailability === option.value ? 'bg-gray-100 font-medium' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price Dropdown (Placeholder for now) */}
        <div className="relative">
          <button className="flex items-center gap-2 text-sm font-medium text-black hover:text-gray-700">
            Price
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Right Side - Count, Sort, Grid Toggle */}
      <div className="flex items-center gap-6">
        {/* Items Count */}
        <span className="text-sm text-gray-600">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 text-sm font-medium text-black hover:text-gray-700"
          >
            Sort
            <ChevronDown size={16} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showSortDropdown && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 shadow-lg py-2 min-w-[250px] z-10">
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    selectedSort === option.value ? 'bg-gray-100 font-medium' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid View Toggle */}
        <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
          <button
            onClick={() => onGridViewChange(4)}
            className={`p-2 transition-colors ${
              currentGridView === 4 ? 'text-black' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="4 columns"
          >
            <Grid2x2 size={20} />
          </button>
          <button
            onClick={() => onGridViewChange(6)}
            className={`p-2 transition-colors ${
              currentGridView === 6 ? 'text-black' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="6 columns"
          >
            <Grid3x3 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
