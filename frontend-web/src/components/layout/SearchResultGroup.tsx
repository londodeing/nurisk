/**
 * SearchResultGroup Component
 * Grouped search results by category
 */

import { AlertCircle, Users, Home, Warehouse, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategoryLabel, type SearchCategory, type SearchResult } from '@/services/searchService';
import { SearchResultItem } from './SearchResultItem';

interface SearchResultGroupProps {
  category: SearchCategory;
  results: SearchResult[];
  query: string;
  selectedIndex: number;
  onSelect: (result: SearchResult) => void;
}

const CATEGORY_ICONS: Record<SearchCategory, React.ReactNode> = {
  incidents: <AlertCircle className="h-4 w-4 text-red-500" />,
  volunteers: <Users className="h-4 w-4 text-blue-500" />,
  shelters: <Home className="h-4 w-4 text-green-500" />,
  warehouses: <Warehouse className="h-4 w-4 text-amber-500" />,
  resources: <Package className="h-4 w-4 text-purple-500" />,
};

const CATEGORY_COLORS: Record<SearchCategory, string> = {
  incidents: 'bg-red-50 border-red-200',
  volunteers: 'bg-blue-50 border-blue-200',
  shelters: 'bg-green-50 border-green-200',
  warehouses: 'bg-amber-50 border-amber-200',
  resources: 'bg-purple-50 border-purple-200',
};

export function SearchResultGroup({
  category,
  results,
  query,
  selectedIndex,
  onSelect,
}: SearchResultGroupProps) {
  const label = getCategoryLabel(category);
  const icon = CATEGORY_ICONS[category];
  const colorClass = CATEGORY_COLORS[category];

  // Calculate starting index for this category
  const categoryStartIndex = getCategoryStartIndex(category, results);

  return (
    <div className={cn('mb-4 last:mb-0', colorClass)}>
      {/* Category Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        {icon}
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-xs text-slate-400">({results.length})</span>
      </div>

      {/* Results */}
      <div className="space-y-1">
        {results.map((result, index) => (
          <SearchResultItem
            key={result.id}
            result={result}
            query={query}
            isSelected={selectedIndex === categoryStartIndex + index}
            onSelect={() => onSelect(result)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Calculate starting index for a category
 */
function getCategoryStartIndex(
  category: SearchCategory,
  allResults: SearchResult[]
): number {
  const categories: SearchCategory[] = [
    'incidents',
    'volunteers',
    'shelters',
    'warehouses',
    'resources',
  ];

  let startIndex = 0;
  const categoryIndex = categories.indexOf(category);

  for (let i = 0; i < categoryIndex; i++) {
    const cat = categories[i];
    startIndex += allResults.filter((r) => r.type === cat).length;
  }

  return startIndex;
}

export default SearchResultGroup;