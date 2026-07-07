import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { DROPDOWN_OPTIONS, BrandDetail } from '../utils/brands';

interface SearchableBrandDropdownProps {
  selectedBrand: string;
  onBrandSelect: (brandKey: string) => void;
}

export const SearchableBrandDropdown: React.FC<SearchableBrandDropdownProps> = ({
  selectedBrand,
  onBrandSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredBrands = Object.entries(DROPDOWN_OPTIONS).filter(([_, brand]) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedBrandData = selectedBrand ? DROPDOWN_OPTIONS[selectedBrand] : null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#0c0c1c]/80 border border-[#1c1c38] hover:border-[#2b2b54] rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center min-w-0">
          {selectedBrandData ? (
            <>
              <span
                className="w-3.5 h-3.5 rounded-full mr-2.5 border border-white/20 flex-shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                style={{ backgroundColor: selectedBrandData.bgcolor }}
              ></span>
              <span className="truncate">{selectedBrandData.name}</span>
            </>
          ) : (
            <span className="text-slate-400">-- Select a Brand --</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1.5 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-[#090915] border border-[#1c1c38] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Search Box */}
          <div className="p-2 border-b border-[#1c1c38] flex items-center bg-[#0c0c1c]/50">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0 ml-1" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search brands..."
              className="w-full bg-transparent text-xs font-medium text-slate-200 outline-none placeholder-slate-500"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-[10px] text-slate-400 hover:text-white font-semibold px-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* List Options */}
          <div className="max-h-60 overflow-y-auto p-1.5 flex flex-col gap-0.5 custom-scrollbar">
            {filteredBrands.length > 0 ? (
              filteredBrands.map(([key, brand]) => {
                const isSelected = selectedBrand === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onBrandSelect(key);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                      isSelected
                        ? 'bg-[#181836] text-white'
                        : 'text-slate-400 hover:bg-[#181836]/50 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full mr-2.5 border border-white/10 flex-shrink-0"
                        style={{ backgroundColor: brand.bgcolor }}
                      ></span>
                      <span className="truncate">{brand.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#3b82f6] flex-shrink-0 ml-1.5" />}
                  </button>
                );
              })
            ) : (
              <div className="text-center py-4 text-xs font-semibold text-slate-500">
                No brands found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
