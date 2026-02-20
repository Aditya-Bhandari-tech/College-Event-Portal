import React from 'react';

/**
 * Reusable Button — project-wide.
 *
 * variant : 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
 * size    : 'sm' | 'md' | 'lg'
 * loading : bool   — shows spinner, disables click
 * icon    : ReactNode — optional leading icon
 */
const VARIANTS = {
  primary:
    'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25 active:opacity-90',
  secondary:
    'border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100',
  danger:
    'bg-red-500 hover:bg-red-600 text-white active:bg-red-700',
  'danger-outline':
    'border border-red-200 text-red-600 hover:bg-red-50 active:bg-red-100',
  ghost:
    'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
  success:
    'bg-emerald-500 hover:bg-emerald-600 text-white active:bg-emerald-700',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  className = '',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-150 cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${VARIANTS[variant] ?? VARIANTS.primary}
        ${SIZES[size] ?? SIZES.md}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 15} className="flex-shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;