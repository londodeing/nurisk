import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ToasterProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

const Toaster = React.forwardRef<HTMLDivElement, ToasterProps>(
  ({ className, position = 'bottom-right', ...props }, ref) => {
    const positionClass = {
      'top-left': 'top-4 left-4',
      'top-center': 'top-4 left-1/2 -translate-x-1/2',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
      'bottom-right': 'bottom-4 right-4',
    }[position];

    return (
      <div
        ref={ref}
        className={cn(
          'fixed z-[100] flex flex-col gap-2',
          positionClass,
          className
        )}
        {...props}
      />
    );
  }
);
Toaster.displayName = 'Toaster';

export { Toaster };