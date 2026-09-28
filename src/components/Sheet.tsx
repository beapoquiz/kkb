import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from './Button';
import { useFocusTrap } from './useFocusTrap';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Visually hide the title (it is still announced). */
  hideTitle?: boolean;
  children: ReactNode;
  /** Sticky footer, e.g. the Save button. */
  footer?: ReactNode;
  role?: 'dialog' | 'alertdialog';
  size?: 'full' | 'compact';
}

/**
 * Bottom sheet on phones, centered modal on wider screens. Traps focus, closes on Esc or a
 * backdrop click, locks page scroll, and fades instead of sliding for reduced motion.
 */
export function Sheet({
  open,
  onClose,
  title,
  hideTitle,
  children,
  footer,
  role = 'dialog',
  size = 'full',
}: SheetProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const reduce = useReducedMotion();
  useFocusTrap(panel, open, onClose);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const slide = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panel}
            role={role}
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            {...slide}
            transition={{ type: 'spring', stiffness: 400, damping: 36 }}
            className={`relative flex w-full max-w-[480px] flex-col rounded-t-sheet bg-surface shadow-float outline-none sm:rounded-sheet ${size === 'full' ? 'max-h-[92dvh]' : 'max-h-[80dvh]'}`}
          >
            <div className="flex justify-center pt-3 sm:hidden" aria-hidden="true">
              <span className="h-[5px] w-10 rounded-full bg-line" />
            </div>
            <div className="flex items-center justify-between gap-2 px-5 pt-2 sm:pt-5">
              <h2 id={titleId} className={`text-h2 font-medium ${hideTitle ? 'sr-only' : ''}`}>
                {title}
              </h2>
              <IconButton label="Close" onClick={onClose} className="-mr-2" data-focus-skip>
                <X size={22} aria-hidden="true" />
              </IconButton>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-2 pb-5">{children}</div>
            {footer && (
              <div className="border-t border-line px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
