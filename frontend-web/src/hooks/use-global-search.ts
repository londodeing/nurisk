/**
 * useGlobalSearch Hook
 * 100% SDK-driven - no axios/legacy HTTP
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { searchApi } from '@nurisk/sdk';
import type { SearchResult } from '@nurisk/shared-types/search';

// Local storage functions (not API)
const STORAGE_KEY = 'nurisk_recent_searches';
const SUGGESTIONS_KEY = 'nurisk_search_suggestions';

const getRecentSearches = (): { id: string; query: string; timestamp: number }[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentSearch = (query: string) => {
  const recent = getRecentSearches();
  const newEntry = { id: crypto.randomUUID(), query, timestamp: Date.now() };
  const updated = [newEntry, ...recent.filter((r) => r.query !== query)].slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

const clearRecentSearches = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const removeRecentSearch = (id: string) => {
  const recent = getRecentSearches().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
};

const getSuggestions = (query: string): string[] => {
  try {
    const stored = localStorage.getItem(SUGGESTIONS_KEY);
    if (!stored) return [];
    const suggestions: string[] = JSON.parse(stored);
    return suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase()));
  } catch {
    return [];
  }
};

// =============================================================================
// Types
// =============================================================================

export interface UseGlobalSearchState {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  selectedIndex: number;
  isOpen: boolean;
  recentSearches: { id: string; query: string; timestamp: number }[];
  suggestions: string[];
}

export interface UseGlobalSearchReturn extends UseGlobalSearchState {
  setQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
  selectResult: (index: number) => void;
  selectNext: () => void;
  selectPrevious: () => void;
  getSelectedResult: () => SearchResult | null;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  clearRecent: () => void;
  removeRecent: (id: string) => void;
}

// =============================================================================
// Constants
// =============================================================================

const DEBOUNCE_DELAY = 300;
const MIN_QUERY_LENGTH = 2;

// =============================================================================
// Hook
// =============================================================================

/**
 * useGlobalSearch hook
 */
export function useGlobalSearch(): UseGlobalSearchReturn {
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(
    getRecentSearches()
  );
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await searchApi.search({ q: query, limit: 20 });
        setResults(response.results);
        setSuggestions(getSuggestions(query));
        setSelectedIndex(response.results.length > 0 ? 0 : -1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  /**
   * Set query
   */
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  /**
   * Search
   */
  const search = useCallback(async (searchQuery: string) => {
    setQueryState(searchQuery);
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      setRecentSearches(getRecentSearches());
    }
  }, []);

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setQueryState('');
    setResults([]);
    setSuggestions([]);
    setSelectedIndex(-1);
    setError(null);
  }, []);

  /**
   * Select result by index
   */
  const selectResult = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  /**
   * Select next result
   */
  const selectNext = useCallback(() => {
    setSelectedIndex((prev) => {
      const maxIndex = results.length - 1;
      if (prev >= maxIndex) return 0;
      return prev + 1;
    });
  }, [results.length]);

  /**
   * Select previous result
   */
  const selectPrevious = useCallback(() => {
    setSelectedIndex((prev) => {
      const maxIndex = results.length - 1;
      if (prev <= 0) return maxIndex;
      return prev - 1;
    });
  }, [results.length]);

  /**
   * Get selected result
   */
  const getSelectedResult = useCallback((): SearchResult | null => {
    if (selectedIndex >= 0 && selectedIndex < results.length) {
      return results[selectedIndex];
    }
    return null;
  }, [results, selectedIndex]);

  /**
   * Open search
   */
  const openSearch = useCallback(() => {
    setIsOpen(true);
    setRecentSearches(getRecentSearches());
  }, []);

  /**
   * Close search
   */
  const closeSearch = useCallback(() => {
    setIsOpen(false);
    clearSearch();
  }, [clearSearch]);

  /**
   * Toggle search
   */
  const toggleSearch = useCallback(() => {
    if (isOpen) {
      closeSearch();
    } else {
      openSearch();
    }
  }, [isOpen, openSearch, closeSearch]);

  /**
   * Clear recent searches
   */
  const clearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  /**
   * Remove single recent search
   */
  const removeRecent = useCallback((id: string) => {
    removeRecentSearch(id);
    setRecentSearches(getRecentSearches());
  }, []);

  return {
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
    clearSearch,
    selectResult,
    selectNext,
    selectPrevious,
    getSelectedResult,
    openSearch,
    closeSearch,
    toggleSearch,
    clearRecent,
    removeRecent,
  };
}

/**
 * useSearchShortcut hook
 * Hook for keyboard shortcut
 */
export function useSearchShortcut(callback: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [callback]);
}

export default useGlobalSearch;