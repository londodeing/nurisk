'use client';

import { Button } from '@/components/ui/button';
import { FileQuestion, RefreshCw, Plus, Search } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'default' | 'search' | 'create';
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  onRefresh?: () => void;
}

const icons = {
  default: FileQuestion,
  search: Search,
  create: Plus,
};

export function EmptyState({
  icon = 'default',
  title,
  description,
  actionLabel,
  onAction,
  onRefresh,
}: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
        <Icon className="h-10 w-10 text-gray-400" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>

      {description && (
        <p className="mb-6 max-w-md text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="default">
            <Plus className="mr-2 h-4 w-4" />
            {actionLabel}
          </Button>
        )}

        {onRefresh && (
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Muat Ulang
          </Button>
        )}
      </div>
    </div>
  );
}