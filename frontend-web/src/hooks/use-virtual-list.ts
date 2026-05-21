/**
 * Virtual scrolling hook for performance optimization with large lists
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

export interface VirtualListOptions<T> {
  /** The items to render */
  items: T[];
  /** Height of each item in pixels */
  itemHeight: number;
  /** Number of overscan items to render above/below viewport */
  overscan?: number;
  /** Container height in pixels */
  containerHeight: number;
  /** Key extractor for items */
  getItemKey: (item: T, index: number) => string | number;
}

export interface VirtualListResult<T> {
  /** The visible items to render */
  visibleItems: T[];
  /** Index of first visible item */
  startIndex: number;
  /** Index of last visible item */
  endIndex: number;
  /** Total scroll height */
  totalHeight: number;
  /** Padding top for scroll positioning */
  paddingTop: number;
  /** Container style for virtualization */
  containerStyle: React.CSSProperties;
  /** Function to handle scroll event */
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  /** Ref to the scroll container */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Function to scroll to a specific index */
  scrollToIndex: (index: number) => void;
  /** Function to scroll to a specific item */
  scrollToItem: (item: T) => void;
}

/**
 * Hook for virtual scrolling - renders only visible items plus overscan
 */
export function useVirtualList<T>({
  items,
  itemHeight,
  overscan = 3,
  containerHeight,
  getItemKey,
}: VirtualListOptions<T>): VirtualListResult<T> {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const { startIndex, endIndex, paddingTop, totalHeight } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;
    const end = Math.min(items.length, start + visibleCount);
    
    return {
      startIndex: start,
      endIndex: end,
      paddingTop: start * itemHeight,
      totalHeight: items.length * itemHeight,
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  // Handle scroll event
  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);
  }, []);

  // Scroll to specific index
  const scrollToIndex = useCallback(
    (index: number) => {
      if (containerRef.current) {
        const scrollPosition = index * itemHeight;
        containerRef.current.scrollTop = scrollPosition;
      }
    },
    [itemHeight]
  );

  // Scroll to specific item
  const scrollToItem = useCallback(
    (item: T) => {
      const index = items.findIndex((i) => getItemKey(i, items.indexOf(i)) === getItemKey(item, items.indexOf(item)));
      if (index >= 0) {
        scrollToIndex(index);
      }
    },
    [items, getItemKey, scrollToIndex]
  );

  const containerStyle = useMemo(
    () => ({
      height: containerHeight,
      overflow: 'auto' as const,
      position: 'relative' as const,
    }),
    [containerHeight]
  );

  return {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    paddingTop,
    containerStyle,
    onScroll,
    containerRef,
    scrollToIndex,
    scrollToItem,
  };
}

/**
 * Hook for infinite scroll with virtualization
 */
export function useInfiniteVirtualList<T>({
  items,
  itemHeight,
  overscan = 3,
  containerHeight,
  getItemKey,
  loadMore,
  hasMore,
  isLoading,
}: VirtualListOptions<T> & {
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}) {
  const {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    paddingTop,
    containerStyle,
    onScroll,
    containerRef,
    scrollToIndex,
    scrollToItem,
  } = useVirtualList({
    items,
    itemHeight,
    overscan,
    containerHeight,
    getItemKey,
  });

  // Load more when near end
  useEffect(() => {
    if (endIndex >= items.length - overscan && hasMore && !isLoading) {
      loadMore();
    }
  }, [endIndex, items.length, hasMore, isLoading, loadMore, overscan]);

  return {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    paddingTop,
    containerStyle,
    onScroll,
    containerRef,
    scrollToIndex,
    scrollToItem,
  };
}

export default useVirtualList;