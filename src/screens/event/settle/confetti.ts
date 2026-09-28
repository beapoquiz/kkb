import confetti from 'canvas-confetti';

/** Token colors only: blue, pink, mint, gold, lavender. */
const COLORS = ['#7CC4F5', '#FFC8DD', '#BDF0D8', '#F5C542', '#D9CCFF'];

export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/** A soft burst from both sides. Does nothing for reduced motion (the UI shows ✨ instead). */
export function celebrate() {
  if (prefersReducedMotion()) return;
  const base = { particleCount: 70, spread: 70, startVelocity: 45, colors: COLORS, scalar: 0.9 };
  void confetti({ ...base, angle: 60, origin: { x: 0, y: 0.7 } });
  void confetti({ ...base, angle: 120, origin: { x: 1, y: 0.7 } });
}
