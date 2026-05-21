import * as React from 'react';
import { cn } from '@/lib/utils';
import { Circle } from 'lucide-react';

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, onValueChange, defaultValue, children, ...props }, ref) => {
    const [value, setValue] = React.useState(defaultValue || '');

    const handleValueChange = (newValue: string) => {
      setValue(newValue);
      onValueChange?.(newValue);
    };

    return (
      <div
        ref={ref}
        className={cn('grid gap-2', className)}
        data-value={value}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              onValueChange: handleValueChange,
              value: value,
            });
          }
          return child;
        })}
      </div>
    );
  }
);
RadioGroup.displayName = 'RadioGroup';

export interface RadioGroupItemProps extends React.HTMLAttributes<HTMLInputElement> {
  value: string;
  onValueChange?: (value: string) => void;
  checkedValue?: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, onValueChange, checkedValue, ...props }, ref) => {
    const isChecked = checkedValue === value;

    return (
      <label
        className={cn(
          'flex cursor-pointer items-center space-x-2',
          className
        )}
      >
        <input
          type="radio"
          ref={ref}
          value={value}
          checked={isChecked}
          onChange={() => onValueChange?.(value)}
          className="sr-only"
          {...props}
        />
        <span
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-full border border-slate-300',
            isChecked && 'border-nu-green'
          )}
        >
          {isChecked && <Circle className="h-2.5 w-2.5 fill-nu-green text-nu-green" />}
        </span>
        <span className="text-sm">{props.children}</span>
      </label>
    );
  }
);
RadioGroupItem.displayName = 'RadioGroupItem';

export interface RadioGroupIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {}

const RadioGroupIndicator = React.forwardRef<HTMLSpanElement, RadioGroupIndicatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('flex h-4 w-4 items-center justify-center', className)}
        {...props}
      >
        <Circle className="h-2.5 w-2.5 fill-nu-green text-nu-green" />
      </span>
    );
  }
);
RadioGroupIndicator.displayName = 'RadioGroupIndicator';

export { RadioGroup, RadioGroupItem, RadioGroupIndicator };