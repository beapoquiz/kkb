import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: string | null;
}

export const inputClass =
  'h-12 rounded-input border-[1.5px] border-line bg-surface px-4 text-base text-ink placeholder:text-ink-muted focus:border-blue-strong focus:ring-2 focus:ring-blue-strong focus:outline-none aria-[invalid=true]:border-pink-strong';

/** Labelled text input with an optional hint and an inline error. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hideLabel, hint, error, id, className = '', ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');
  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className={hideLabel ? 'sr-only' : 'mb-1.5 block text-label font-bold text-ink'}
      >
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={`${inputClass} w-full`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-caption text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-caption font-bold text-pink-strong" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

/** Section label used above chip rows. */
export function FieldLabel({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <p id={id} className="mb-2 text-label font-bold text-ink">
      {children}
    </p>
  );
}
