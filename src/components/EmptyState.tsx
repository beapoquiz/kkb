import type { ReactNode } from 'react';
import { Plutus, type PlutusMood } from '../mascot/Plutus';

/** Plutus + a heading + one clear next action. */
export function EmptyState({
  mood,
  title,
  text,
  children,
  headingLevel = 2,
}: {
  mood: PlutusMood;
  title: string;
  text?: ReactNode;
  children?: ReactNode;
  headingLevel?: 1 | 2;
}) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center">
      <Plutus mood={mood} size={150} decorative />
      <Heading className="mt-2 text-h1 font-semibold">{title}</Heading>
      {text && <p className="mt-2 max-w-72 text-ink-muted">{text}</p>}
      {children && <div className="mt-6 flex w-full max-w-72 flex-col gap-3">{children}</div>}
    </div>
  );
}
