import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 touch-target';

  const variants = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary-dark shadow-sm',
    secondary: 'bg-surface-subtle text-slate-700 hover:bg-slate-200 border border-surface-border',
    accent: 'bg-brand-accent text-white hover:bg-brand-accent-hover shadow-sm',
    outline: 'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/5',
    ghost: 'text-slate-600 hover:bg-surface-subtle hover:text-slate-900',
    danger: 'bg-civic-danger text-white hover:bg-red-700 shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 min-h-[40px]',
    md: 'text-sm px-4 py-2.5 min-h-[48px]',
    lg: 'text-base px-6 py-3 min-h-[52px]',
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />
      ) : leftIcon ? (
        <span className="mr-2 inline-flex items-center">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon && (
        <span className="ml-2 inline-flex items-center">{rightIcon}</span>
      )}
    </button>
  );
};
