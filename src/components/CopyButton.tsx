import { Copy } from 'lucide-react';
import { Button } from './Button';
import { copyWithToast } from './clipboard';

/** A small icon button that copies `text` and shows "Copied!". */
export function CopyIconButton({ text, label }: { text: string; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => void copyWithToast(text)}
      className="squish inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-blue-strong hover:bg-blue-soft"
    >
      <Copy size={18} aria-hidden="true" />
    </button>
  );
}

export function CopyButton({
  text,
  children,
  variant = 'secondary',
}: {
  text: string;
  children: string;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <Button
      variant={variant}
      block
      icon={<Copy size={18} aria-hidden="true" />}
      onClick={() => void copyWithToast(text)}
    >
      {children}
    </Button>
  );
}
