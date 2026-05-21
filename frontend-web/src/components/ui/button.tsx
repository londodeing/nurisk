import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'emergency' | 'danger';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nu-green disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      default: 'bg-nu-green text-white hover:bg-nu-green/90',
      destructive: 'bg-danger-red text-white hover:bg-danger-red/90',
      outline: 'border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-100/80',
      ghost: 'hover:bg-slate-100 hover:text-slate-900',
      link: 'text-nu-green underline-offset-4 hover:underline',
      emergency: 'bg-danger-red text-white hover:bg-danger-red/90 animate-pulse',
      danger: 'bg-danger-red text-white hover:bg-danger-red/90',
    };
    
    const sizes = {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-10 rounded-md px-8',
      icon: 'h-9 w-9',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
export default Button;