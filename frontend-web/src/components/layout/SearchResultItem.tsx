/**
 * SearchResultItem Component
 * Individual search result item with highlighted text
 */

import { useMemo } from 'react';
import { AlertCircle, Users, Home, Warehouse, Package, MapPin, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { highlightMatch, type SearchResult, type SearchCategory } from '@/services/searchService';

interface SearchResultItemProps {
  result: SearchResult;
  query: string;
  isSelected: boolean;
  onSelect: () => void;
}

const TYPE_ICONS: Record<SearchCategory, React.ReactNode> = {
  incidents: <AlertCircle className="h-4 w-4" />,
  volunteers: <Users className="h-4 w-4" />,
  shelters: <Home className="h-4 w-4" />,
  warehouses: <Warehouse className="h-4 w-4" />,
  resources: <Package className="h-4 w-4" />,
};

const TYPE_COLORS: Record<SearchCategory, string> = {
  incidents: 'text-red-500',
  volunteers: 'text-blue-500',
  shelters: 'text-green-500',
  warehouses: 'text-amber-500',
  resources: 'text-purple-500',
};

export function SearchResultItem({
  result,
  query,
  isSelected,
  onSelect,
}: SearchResultItemProps) {
  const icon = TYPE_ICONS[result.type];
  const colorClass = TYPE_COLORS[result.type];

  // Highlight matched text
  const highlightedTitle = useMemo(
    () => highlightMatch(result.title, query),
    [result.title, query]
  );

  const highlightedSubtitle = useMemo(
    () => (result.subtitle ? highlightMatch(result.subtitle, query) : ''),
    [result.subtitle, query]
  );

  // Get status color
  const statusColor = getStatusColor(result.status);

  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-colors',
        isSelected
          ? 'bg-nu-green text-white'
          : 'hover:bg-slate-100'
      )}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0', isSelected ? 'text-white' : colorClass)}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <div
          className={cn(
            'text-sm font-medium truncate',
            isSelected ? 'text-white' : 'text-slate-700'
          )}
          dangerouslySetInnerHTML={{ __html: highlightedTitle }}
        />

        {/* Subtitle */}
        {result.subtitle && (
          <div
            className={cn(
              'text-xs truncate',
              isSelected ? 'text-white/80' : 'text-slate-500'
            )}
            dangerouslySetInnerHTML={{ __html: highlightedSubtitle }}
          />
        )}

        {/* Location */}
        {result.location && (
          <div
            className={cn(
              'text-xs flex items-center gap-1 truncate mt-0.5',
              isSelected ? 'text-white/60' : 'text-slate-400'
            )}
          >
            <MapPin className="h-3 w-3" />
            <span>{result.location}</span>
          </div>
        )}
      </div>

      {/* Status Badge */}
      {result.status && (
        <div
          className={cn(
            'flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium',
            isSelected ? 'bg-white/20 text-white' : statusColor
          )}
        >
          {result.status}
        </div>
      )}

      {/* Arrow */}
      <ArrowRight
        className={cn(
          'h-4 w-4 flex-shrink-0',
          isSelected ? 'text-white' : 'text-slate-300'
        )}
      />
    </button>
  );
}

/**
 * Get status color class
 */
function getStatusColor(status?: string): string {
  if (!status) return 'bg-slate-100 text-slate-600';

  const statusLower = status.toLowerCase();

  if (statusLower === 'active' || statusLower === 'terjadi') {
    return 'bg-red-100 text-red-600';
  }
  if (statusLower === 'resolved' || statusLower === 'selesai') {
    return 'bg-green-100 text-green-600';
  }
  if (statusLower === 'pending' || statusLower === 'menunggu') {
    return 'bg-yellow-100 text-yellow-600';
  }
  if (statusLower === 'investigating' || statusLower === 'investigasi') {
    return 'bg-blue-100 text-blue-600';
  }

  return 'bg-slate-100 text-slate-600';
}

export default SearchResultItem;