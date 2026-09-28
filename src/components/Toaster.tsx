import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useToastStore } from '../store/toast';

/** Bottom-center toast above the FAB. Announced politely to screen readers. */
export function Toaster() {
  const current = useToastStore((s) => s.current);
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    if (!current) return;
    const timer = window.setTimeout(() => dismiss(current.id), current.duration);
    return () => window.clearTimeout(timer);
  }, [current, dismiss]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-[60] mx-auto flex max-w-[480px] justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="pointer-events-auto flex items-center gap-4 rounded-full bg-ink py-3 pr-3 pl-5 text-white shadow-float"
          >
            <span className="font-semibold">{current.message}</span>
            {current.action && (
              <button
                type="button"
                className="squish rounded-full px-3 py-1 font-bold text-blue-soft hover:bg-white/10"
                onClick={() => {
                  current.action?.onClick();
                  dismiss(current.id);
                }}
              >
                {current.action.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
