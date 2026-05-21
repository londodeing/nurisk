import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  content?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, content, side = 'top', sideOffset = 4, children, ...props }, ref) => {
    const [show, setShow] = React.useState(false);

    const positionClass = {
      top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      right: 'left-full top-1/2 -translate-y-1/2 ml-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    }[side];

    return (
      <div
        ref={ref}
        className={cn('relative inline-block', className)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        {...props}
      >
        {children}
        {show && content && (
          <div
            className={cn(
              'absolute z-50 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white shadow',
              positionClass
            )}
          >
            {content}
          </div>
        )}
      </div>
    );
  }
);
Tooltip.displayName = 'Tooltip';

export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, side = 'top', sideOffset = 4, ...props }, ref) => {
    const positionClass = {
      top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      right: 'left-full top-1/2 -translate-y-1/2 ml-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    }[side];

    return (
      <div
        ref={ref}
        className={cn(
          'z-50 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white shadow',
          positionClass,
          className
        )}
        {...props}
      />
    );
  }
);
TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipContent };