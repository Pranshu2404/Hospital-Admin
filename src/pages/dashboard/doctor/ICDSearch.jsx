// components/ICDSearch.jsx
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { FaCode, FaTimes, FaStethoscope } from 'react-icons/fa';
import { debounce } from 'lodash';
import apiClient from '@/api/apiClient';

const ICDSearch = ({ 
  onSelect, 
  value, 
  placeholder = "Search diagnosis (ICD-11)...", 
  className = "",
  required = false,
  label = "Diagnosis (ICD-11)",
  error = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState('');

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const lastValueRef = useRef(value);
  const searchCacheRef = useRef(new Map());

  // Sync with external value prop
  useEffect(() => {
    const valueChanged = value !== lastValueRef.current;
    
    if (valueChanged) {
      lastValueRef.current = value;
      if (value && !isFocused) {
        setSearchTerm(value);
        // Try to extract code from display value
        const codeMatch = value.match(/^([A-Z0-9\.]+)/);
        if (codeMatch) {
          setSelectedCode(codeMatch[1]);
        }
      }
    } else if (!isFocused && value) {
      setSearchTerm(value);
    }
  }, [value, isFocused]);

  // Filter local results from already loaded data
  const filteredResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    
    if (!term || !results || results.length === 0) {
      return [];
    }
    
    // Filter out null/undefined items and ensure valid structure
    const validResults = results.filter(item => item && item.code && item.title);
    
    if (validResults.length === 0) {
      return [];
    }
    
    // Split search term into words for better matching
    const searchWords = term.split(/\s+/).filter(word => word.length > 0);
    
    // Filter and score results
    const filtered = validResults
      .map(item => {
        const haystack = `${item.code || ''} ${item.title || ''}`.toLowerCase();
        
        let score = 0;
        
        // Exact match on code (highest priority)
        if (item.code && item.code.toLowerCase() === term) {
          score += 100;
        }
        // Code starts with search term
        else if (item.code && item.code.toLowerCase().startsWith(term)) {
          score += 80;
        }
        // Title starts with search term
        else if (item.title && item.title.toLowerCase().startsWith(term)) {
          score += 60;
        }
        // Contains search term
        else if (haystack.includes(term)) {
          score += 30;
        }
        
        // Word matches
        searchWords.forEach(word => {
          if (word.length > 1) {
            if (haystack.startsWith(word)) score += 15;
            else if (haystack.includes(` ${word}`)) score += 10;
            else if (haystack.includes(word)) score += 5;
          }
        });
        
        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
    
    return filtered;
  }, [searchTerm, results]);

  // Search ICD-11 API
  const searchICD = useCallback(
    debounce(async (query) => {
      if (query.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      // Check cache first
      const cachedResult = searchCacheRef.current.get(query);
      if (cachedResult && Array.isArray(cachedResult)) {
        setResults(cachedResult);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await apiClient.get(`/icd11/search?q=${encodeURIComponent(query)}&limit=20`);
        if (response.data && response.data.success && response.data.results) {
          const newResults = response.data.results;
          setResults(newResults);
          searchCacheRef.current.set(query, newResults);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Error searching ICD-11:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const next = e.target.value;
    setSearchTerm(next);
    setActiveIndex(0);
    
    if (next && next.trim()) {
      setIsOpen(true);
      searchICD(next);
      setSelectedCode(null);
      setSelectedTitle('');
    } else {
      setIsOpen(false);
      setResults([]);
      if (onSelect) onSelect(null);
    }
  };

  const handleSelect = (item) => {
    if (!item || !item.code || !item.title) return;
    
    const displayValue = `${item.code} - ${item.title}`;
    setSearchTerm(displayValue);
    setSelectedCode(item.code);
    setSelectedTitle(item.title);
    setIsOpen(false);
    setActiveIndex(0);
    
    if (onSelect) {
      onSelect({
        code: item.code,
        title: item.title,
        display: displayValue
      });
    }
    
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedCode(null);
    setSelectedTitle('');
    setResults([]);
    setIsOpen(false);
    setActiveIndex(0);
    if (onSelect) onSelect(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && filteredResults[activeIndex]) {
          handleSelect(filteredResults[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(0);
        break;
      default:
        break;
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      setIsOpen(false);
      setActiveIndex(0);
    }, 150);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsFocused(false);
        setActiveIndex(0);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`mb-4 ${className} relative`} ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`block w-full px-3 py-3 bg-white border ${error ? 'border-red-300' : 'border-gray-300'} 
              text-gray-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 
              focus:border-teal-500 transition-all pl-10 pr-10`}
            autoComplete="off"
            spellCheck="false"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
            <FaStethoscope className="text-gray-400 text-sm" />
          </div>

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {!!searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600"
                title="Clear"
              >
                <FaTimes size={14} />
              </button>
            )}
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
            )}
          </div>
        </div>

        {/* Dropdown Results */}
        {isOpen && (filteredResults.length > 0 || (searchTerm && searchTerm.length >= 2 && !loading)) && (
          <div className="absolute border border-gray-200 z-50 w-full mt-1 bg-white rounded-xl shadow-xl overflow-hidden max-h-80">
            <div className="overflow-y-auto max-h-[320px]">
              {filteredResults.length > 0 ? (
                filteredResults.map((item, index) => (
                  <div
                    key={item.code}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors border-b border-gray-50 last:border-0 
                      ${index === activeIndex ? 'bg-teal-50 text-teal-900 font-semibold' : 'text-gray-700 hover:bg-gray-50'}
                      ${selectedCode === item.code ? 'bg-teal-100/50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <FaCode className={`text-sm ${index === activeIndex ? 'text-teal-600' : 'text-teal-500'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          <span className="font-mono text-sm">{item.code}</span>
                          <span className="mx-2 text-gray-400">-</span>
                          <span className="text-gray-800">{item.title}</span>
                        </div>
                        {item.definition && index === activeIndex && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {item.definition.substring(0, 150)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : searchTerm && searchTerm.length >= 2 && !loading ? (
                <div className="p-6 text-center">
                  <div className="text-gray-400 text-sm">No matching ICD-11 codes found</div>
                  <div className="text-xs text-gray-400 mt-1">Try different keywords</div>
                </div>
              ) : searchTerm && searchTerm.length < 2 && (
                <div className="p-6 text-center">
                  <div className="text-gray-400 text-sm">Type at least 2 characters to search</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected ICD Code Badge */}
      {selectedCode && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <FaCode className="mr-1 text-xs" />
            ICD-11: {selectedCode}
          </div>
          {selectedTitle && (
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
              {selectedTitle.length > 50 ? `${selectedTitle.substring(0, 50)}...` : selectedTitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ICDSearch;