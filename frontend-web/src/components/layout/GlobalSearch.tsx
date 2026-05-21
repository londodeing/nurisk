/**
 * GlobalSearch Component
 * Global search with Ctrl+K shortcut, grouped results, and keyboard navigation
 */

import { useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalSearch } from '@/hooks/use-global-search';
import { highlightMatch as _highlightMatch, groupResultsByCategory, type SearchCategory, type SearchResult } from '@/services/searchService';
import { SearchResultGroup } from './SearchResultGroup';

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
  onSelect?: (result: SearchResult) => void;
}

export function GlobalSearch({
  className,
  placeholder = 'Cari incident, relawan, shelter...',
  onSelect,
}: GlobalSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    query,
    results,
    isLoading,
    error,
    selectedIndex,
    isOpen,
    recentSearches,
    suggestions,
    setQuery,
    search,
    clearSearch: _clearSearch,
    selectNext,
    selectPrevious,
    getSelectedResult,
    openSearch,
    closeSearch,
    clearRecent,
  } = useGlobalSearch();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeSearch();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeSearch]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          selectNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          selectPrevious();
          break;
        case 'Enter':
          e.preventDefault();
          const selected = getSelectedResult();
          if (selected) {
            onSelect?.(selected);
            closeSearch();
          }
          break;
        case 'Escape':
          e.preventDefault();
          closeSearch();
          break;
      }
    },
    [selectNext, selectPrevious, getSelectedResult, onSelect, closeSearch]
  );

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      search(suggestion);
    },
    [search]
  );

  // Handle recent search click
  const handleRecentClick = useCallback(
    (recentQuery: string) => {
      search(recentQuery);
    },
    [search]
  );

  // Group results by category
  const groupedResults = groupResultsByCategory(results);
  const categories = Object.keys(groupedResults) as SearchCategory[];

  // Calculate total results
  const totalResults = results.length;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Search Button (closed state) */}
      {!isOpen && (
        <button
          onClick={openSearch}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            'bg-slate-100 hover:bg-slate-200 transition-colors',
            'text-slate-500 text-sm'
          )}
        >
          <Search className="h-4 w-4" />
          <span>{placeholder}</span>
          <kbd className="ml-auto hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 text-xs">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      )}

      {/* Search Modal (open state) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50" onClick={closeSearch} />

          {/* Search Container */}
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="flex-1 text-base text-slate-700 placeholder:text-slate-400 outline-none"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
              <button
                onClick={closeSearch}
                className="p-1 rounded hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {/* Error State */}
              {error && (
                <div className="p-4 text-center text-red-500">
                  <p>{error}</p>
                </div>
              )}

              {/* Loading State */}
              {isLoading && !results.length && (
                <div className="p-8 text-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p>Mencari...</p>
                </div>
              )}

              {/* Empty State - No Query */}
              {!query && !recentSearches.length && (
                <div className="p-8 text-center text-slate-400">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Mulai ketik untuk mencari</p>
                </div>
              )}

              {/* Recent Searches */}
              {!query && recentSearches.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Pencarian Terakhir
                    </h3>
                    <button
                      onClick={clearRecent}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Hapus
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.slice(0, 5).map((recent) => (
                      <button
                        key={recent.id}
                        onClick={() => handleRecentClick(recent.query)}
                        className={cn(
                          'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left',
                          'hover:bg-slate-50 transition-colors'
                        )}
                      >
                        <Clock className="h-4 w-4 text-slate-300" />
                        <span className="text-sm text-slate-700">{recent.query}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {!query && suggestions.length > 0 && (
                <div className="px-4 pb-4">
                  <h3 className="text-sm font-medium text-slate-500 mb-3">
                    Saran
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm',
                          'bg-slate-100 hover:bg-slate-200 transition-colors',
                          'text-slate-600'
                        )}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {query && !isLoading && !totalResults && (
                <div className="p-8 text-center text-slate-400">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Tidak ada hasil untuk &quot;{query}&quot;</p>
                </div>
              )}

              {/* Results */}
              {totalResults > 0 && (
                <div className="p-2">
                  {categories.map((category) => {
                    const categoryResults = groupedResults[category];
                    if (!categoryResults.length) return null;

                    return (
                      <SearchResultGroup
                        key={category}
                        category={category}
                        results={categoryResults}
                        query={query}
                        selectedIndex={selectedIndex}
                        onSelect={(result) => {
                          onSelect?.(result);
                          closeSearch();
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 bg-slate-50 text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200">↓</kbd>
                  <span>Navigasi</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200">↵</kbd>
                  <span>Pilih</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200">esc</kbd>
                  <span>Tutup</span>
                </span>
              </div>
              <span>{totalResults} hasil</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;