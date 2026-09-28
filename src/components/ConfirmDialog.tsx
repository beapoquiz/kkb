import type { ReactNode } from 'react';
import { Button, type ButtonVariant } from './Button';
import { Sheet } from './Sheet';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

/** A small confirm dialog. The cancel button gets focus first, so Enter never destroys data. */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Sheet open={open} onClose={onCancel} title={title} role="alertdialog" size="compact">
      {body && <div className="mb-5 text-ink-muted">{body}</div>}
      <div className="flex gap-3">
        <Button variant="secondary" block onClick={onCancel} data-autofocus>
          {cancelLabel}
        </Button>
        <Button variant={confirmVariant} block onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Sheet>
  );
}
