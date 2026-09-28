import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { IconButton } from './Button';

/** Screen header: a back arrow, a title area, and optional actions on the right. */
export function TopBar({
  onBack,
  backLabel = 'Back',
  children,
  actions,
}: {
  onBack: () => void;
  backLabel?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-1 bg-cream/95 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 backdrop-blur">
      <IconButton label={backLabel} onClick={onBack}>
        <ArrowLeft size={22} aria-hidden="true" />
      </IconButton>
      <div className="min-w-0 flex-1">{children}</div>
      {actions}
    </header>
  );
}
