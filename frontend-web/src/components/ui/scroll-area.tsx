import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('relative overflow-auto', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ScrollArea.displayName = 'ScrollArea';

export interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal';
}

const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
  ({ className, orientation = 'vertical', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex touch-none select-none transition-colors',
          orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent',
          orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent',
          className
        )}
        {...props}
      >
        <div className="relative flex-1 overflow-hidden rounded-full bg-slate-200">
          <div className="relative h-full w-1 origin-center rounded-full bg-slate-400" />
        </div>
      </div>
    );
  }
);
ScrollBar.displayName = 'ScrollBar';

export { ScrollArea, ScrollBar };