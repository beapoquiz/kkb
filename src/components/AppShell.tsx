import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { storageStatus } from '../store/storage';
import { Toaster } from './Toaster';

const BUBBLES = [
  { top: '8%', left: '6%', size: 90 },
  { top: '30%', left: '14%', size: 40 },
  { top: '62%', left: '4%', size: 120 },
  { top: '14%', right: '8%', size: 60 },
  { top: '48%', right: '5%', size: 100 },
  { top: '82%', right: '12%', size: 50 },
];

function Banner({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="flex items-start gap-2 bg-butter px-4 py-2.5 text-caption text-ink">
      <p className="flex-1">{children}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="squish -m-1 rounded-full p-1 hover:bg-white/60"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * The phone-width app column. On wider screens it is centered on a soft gradient with a few
 * faint bubbles. Shows one-time notices for private mode and recovered data.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [privateNotice, setPrivateNotice] = useState(!storageStatus.available);
  const [recoveredNotice, setRecoveredNotice] = useState(storageStatus.recoveredBackupKey !== null);

  return (
    <div className="relative min-h-dvh bg-gradient-to-b from-cream to-blue-soft/40">
      <div className="pointer-events-none fixed inset-0 hidden sm:block" aria-hidden="true">
        {BUBBLES.map((b, i) => (
          <span
            key={i}
            className="absolute rounded-full border-2 border-blue-strong/[0.07] bg-blue/[0.06]"
            style={{ top: b.top, left: b.left, right: b.right, width: b.size, height: b.size }}
          />
        ))}
      </div>
      <div className="relative mx-auto flex min-h-dvh max-w-[480px] flex-col bg-cream sm:shadow-float">
        {privateNotice && (
          <Banner onClose={() => setPrivateNotice(false)}>
            Private mode: your splits won’t be saved after you close this tab.
          </Banner>
        )}
        {recoveredNotice && (
          <Banner onClose={() => setRecoveredNotice(false)}>
            Some saved data couldn’t be read, so KKB started fresh. A backup was kept on this
            device.
          </Banner>
        )}
        {children}
      </div>
      <Toaster />
    </div>
  );
}
