import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-solid';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-blue-strong text-white shadow-card hover:brightness-110',
  secondary: 'border-[1.5px] border-blue-strong bg-surface text-blue-strong hover:bg-blue-soft/40',
  ghost: 'text-ink hover:bg-blue-soft',
  danger: 'text-pink-strong hover:bg-pink-soft/50',
  'danger-solid': 'bg-pink-strong text-white shadow-card hover:brightness-110',
};

const SIZES = {
  md: 'h-12 px-6 text-base',
  sm: 'h-10 px-4 text-label',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: keyof typeof SIZES;
  block?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  icon,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`squish inline-flex items-center justify-center gap-2 rounded-full font-bold disabled:cursor-not-allowed disabled:opacity-45 ${VARIANTS[variant]} ${SIZES[size]} ${block ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: icon-only buttons must say what they do. */
  label: string;
  children: ReactNode;
}

export function IconButton({
  label,
  children,
  className = '',
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`squish inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink hover:bg-blue-soft disabled:opacity-45 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
