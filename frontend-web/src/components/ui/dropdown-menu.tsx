import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Check } from 'lucide-react';

export interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  onOpenChange?: (open: boolean) => void;
}

const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('relative', className)} {...props} />;
  }
);
DropdownMenu.displayName = 'DropdownMenu';

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, ...props }, ref) => {
    return <button ref={ref} className={cn('', className)} {...props} />;
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = 'center', sideOffset = 4, ...props }, ref) => {
    const alignClass = {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0',
    }[align];

    return (
      <div
        ref={ref}
        className={cn(
          'z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-md',
          alignClass,
          className
        )}
        {...props}
      />
    );
  }
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

export interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  disabled?: boolean;
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, inset, disabled, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100',
          disabled && 'pointer-events-none opacity-50',
          inset && 'pl-8',
          className
        )}
        {...props}
      />
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

export interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, inset, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)}
        {...props}
      />
    );
  }
);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

export interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLHRElement> {}

const DropdownMenuSeparator = React.forwardRef<HTMLHRElement, DropdownMenuSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn('-mx-1 my-1 h-px bg-slate-100', className)}
        {...props}
      />
    );
  }
);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export interface DropdownMenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownMenuGroup = React.forwardRef<HTMLDivElement, DropdownMenuGroupProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('', className)} {...props} />;
  }
);
DropdownMenuGroup.displayName = 'DropdownMenuGroup';

export interface DropdownMenuSubProps extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownMenuSub = React.forwardRef<HTMLDivElement, DropdownMenuSubProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('relative', className)} {...props} />;
  }
);
DropdownMenuSub.displayName = 'DropdownMenuSub';

export interface DropdownMenuRadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownMenuRadioGroup = React.forwardRef<HTMLDivElement, DropdownMenuRadioGroupProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('', className)} {...props} />;
  }
);
DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuRadioGroup,
};