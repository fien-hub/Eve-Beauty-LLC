'use client';

import { useState } from 'react';
import { SlidersHorizontal, X, Star, MapPin, DollarSign, Clock } from 'lucide-react';

interface SearchFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  priceMin: number;
  priceMax: number;
  minRating: number;
  maxDistance: number;
  availability: 'any' | 'today' | 'tomorrow' | 'this_week';
  sortBy: 'rating' | 'price_low' | 'price_high' | 'distance' | 'reviews';
}

const defaultFilters: FilterState = {
  priceMin: 0,
  priceMax: 500,
  minRating: 0,
  maxDistance: 50,
  availability: 'any',
  sortBy: 'rating',
};

export default function SearchFilters({ onFiltersChange, initialFilters }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters || defaultFilters);

  const handleChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const activeFiltersCount = [
    filters.priceMin > 0 || filters.priceMax < 500,
    filters.minRating > 0,
    filters.maxDistance < 50,
    filters.availability !== 'any',
  ].filter(Boolean).length;

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${isOpen ? 'bg-[#F4B5A4] text-[#1A1A1A]' : 'bg-white border-2 border-[#E5E5E5] text-[#6B6B6B] hover:border-[#F4B5A4]'}`}>
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {activeFiltersCount > 0 && (
          <span className="bg-[#D97A5F] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeFiltersCount}</span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E5E5E5] p-6 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#1A1A1A]">Filters</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-[#F7F7F7] rounded-full">
              <X className="w-5 h-5 text-[#6B6B6B]" />
            </button>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-[#6B6B6B] mb-2">
              <DollarSign className="w-4 h-4" /> Price Range
            </label>
            <div className="flex items-center gap-2">
              <input type="number" value={filters.priceMin} onChange={(e) => handleChange('priceMin', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border-2 border-[#E5E5E5] rounded-lg text-sm focus:border-[#F4B5A4] focus:outline-none" placeholder="Min" />
              <span className="text-[#9E9E9E]">-</span>
              <input type="number" value={filters.priceMax} onChange={(e) => handleChange('priceMax', parseInt(e.target.value) || 500)}
                className="w-full px-3 py-2 border-2 border-[#E5E5E5] rounded-lg text-sm focus:border-[#F4B5A4] focus:outline-none" placeholder="Max" />
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-[#6B6B6B] mb-2">
              <Star className="w-4 h-4" /> Minimum Rating
            </label>
            <div className="flex gap-2">
              {[0, 3, 3.5, 4, 4.5].map((rating) => (
                <button key={rating} onClick={() => handleChange('minRating', rating)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${filters.minRating === rating ? 'bg-[#F4B5A4] text-[#1A1A1A]' : 'bg-[#F7F7F7] text-[#6B6B6B] hover:bg-[#E5E5E5]'}`}>
                  {rating === 0 ? 'Any' : `${rating}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Distance */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-[#6B6B6B] mb-2">
              <MapPin className="w-4 h-4" /> Max Distance: {filters.maxDistance} mi
            </label>
            <input type="range" min="1" max="50" value={filters.maxDistance} onChange={(e) => handleChange('maxDistance', parseInt(e.target.value))}
              className="w-full h-2 bg-[#E5E5E5] rounded-lg appearance-none cursor-pointer accent-[#F4B5A4]" />
          </div>

          {/* Availability */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-[#6B6B6B] mb-2">
              <Clock className="w-4 h-4" /> Availability
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[{ value: 'any', label: 'Any Time' }, { value: 'today', label: 'Today' }, { value: 'tomorrow', label: 'Tomorrow' }, { value: 'this_week', label: 'This Week' }].map((opt) => (
                <button key={opt.value} onClick={() => handleChange('availability', opt.value)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${filters.availability === opt.value ? 'bg-[#F4B5A4] text-[#1A1A1A]' : 'bg-[#F7F7F7] text-[#6B6B6B] hover:bg-[#E5E5E5]'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="mb-6">
            <label className="text-sm font-medium text-[#6B6B6B] mb-2 block">Sort By</label>
            <select value={filters.sortBy} onChange={(e) => handleChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border-2 border-[#E5E5E5] rounded-lg text-sm focus:border-[#F4B5A4] focus:outline-none bg-white">
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="distance">Nearest</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={handleReset} className="flex-1 py-2.5 border-2 border-[#E5E5E5] rounded-xl font-medium text-[#6B6B6B] hover:bg-[#F7F7F7] transition-colors">
              Reset
            </button>
            <button onClick={() => setIsOpen(false)} className="flex-1 py-2.5 bg-[#F4B5A4] rounded-xl font-medium text-[#1A1A1A] hover:bg-[#E89580] transition-colors">
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

