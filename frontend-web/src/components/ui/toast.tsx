import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success';
  onOpen?: boolean;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = 'default', onOpen, children, ...props }, ref) => {
    if (!onOpen) return null;

    const variantStyles = {
      default: 'bg-white border-slate-200',
      destructive: 'bg-red-50 border-red-200',
      success: 'bg-green-50 border-green-200',
    }[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 shadow-lg',
          variantStyles,
          className
        )}
        {...props}
      >
        <div className="flex flex-1 items-center">{children}</div>
      </div>
    );
  }
);
Toast.displayName = 'Toast';

export interface ToastTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const ToastTitle = React.forwardRef<HTMLHeadingElement, ToastTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h5
        ref={ref}
        className={cn('text-sm font-semibold', className)}
        {...props}
      />
    );
  }
);
ToastTitle.displayName = 'ToastTitle';

export interface ToastDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const ToastDescription = React.forwardRef<HTMLParagraphElement, ToastDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm opacity-90', className)}
        {...props}
      />
    );
  }
);
ToastDescription.displayName = 'ToastDescription';

export interface ToastActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-slate-100',
          className
        )}
        {...props}
      />
    );
  }
);
ToastAction.displayName = 'ToastAction';

export interface ToastCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const ToastClose = React.forwardRef<HTMLButtonElement, ToastCloseProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'absolute right-2 top-2 rounded-md p-1 text-slate-500 opacity-0 transition-opacity hover:text-slate-900 focus:opacity-100 focus:outline-none group-hover:opacity-100',
          className
        )}
        {...props}
      >
        <X className="h-4 w-4" />
      </button>
    );
  }
);
ToastClose.displayName = 'ToastClose';

export { Toast, ToastTitle, ToastDescription, ToastAction, ToastClose };