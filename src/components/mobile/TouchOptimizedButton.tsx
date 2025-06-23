
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TouchOptimizedButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode;
}

const TouchOptimizedButton: React.FC<TouchOptimizedButtonProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <Button
      {...props}
      className={cn(
        "min-h-[44px] touch-manipulation select-none active:scale-95 transition-transform duration-100",
        className
      )}
    >
      {children}
    </Button>
  );
};

export default TouchOptimizedButton;
