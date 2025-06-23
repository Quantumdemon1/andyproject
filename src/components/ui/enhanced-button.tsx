
import React from 'react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  loading = false,
  icon,
  iconPosition = 'left',
  className,
  disabled,
  ...props
}) => {
  return (
    <Button
      {...props}
      disabled={loading || disabled}
      className={cn(
        'transition-all duration-200',
        loading && 'opacity-70 cursor-not-allowed',
        className
      )}
    >
      {loading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-2">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-2">{icon}</span>
          )}
        </>
      )}
    </Button>
  );
};

export default EnhancedButton;
