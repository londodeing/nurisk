import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface SheetProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Sheet = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ className, open, onOpenChange, children, ...props }, ref) => {
    return (
      <>
        {open && (
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => onOpenChange?.(false)}
          />
        )}
        <div
          ref={ref}
          className={cn(
            'fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out',
            open ? 'translate-x-0' : 'translate-x-full',
            'right-0 top-0 h-full w-3/4 max-w-sm',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </>
    );
  }
);
Sheet.displayName = 'Sheet';

export interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ className, ...props }, ref) => {
    return <button ref={ref} className={cn('', className)} {...props} />;
  }
);
SheetTrigger.displayName = 'SheetTrigger';

export interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, onClose, children, ...props }, ref) => {
    return (
      <Sheet ref={ref} className={cn('', className)} {...props}>
        <div className="flex justify-end">
          <button onClick={onClose} className="rounded-sm opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </Sheet>
    );
  }
);
SheetContent.displayName = 'SheetContent';

export interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const SheetHeader = React.forwardRef<HTMLDivElement, SheetHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}
        {...props}
      />
    );
  }
);
SheetHeader.displayName = 'SheetHeader';

export interface SheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const SheetTitle = React.forwardRef<HTMLHeadingElement, SheetTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn('text-lg font-semibold text-slate-900', className)}
        {...props}
      />
    );
  }
);
SheetTitle.displayName = 'SheetTitle';

export interface SheetDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const SheetDescription = React.forwardRef<HTMLParagraphElement, SheetDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-slate-500', className)}
        {...props}
      />
    );
  }
);
SheetDescription.displayName = 'SheetDescription';

export interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const SheetFooter = React.forwardRef<HTMLDivElement, SheetFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
        {...props}
      />
    );
  }
);
SheetFooter.displayName = 'SheetFooter';

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter };