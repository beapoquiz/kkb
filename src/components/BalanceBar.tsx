/**
 * Centered at zero: fills right in mint for "gets back", left in pink for "owes".
 * Width is proportional to the largest absolute balance. Decorative (the text says the amount).
 */
export function BalanceBar({ balance, max }: { balance: number; max: number }) {
  const pct = max === 0 ? 0 : Math.min(50, (Math.abs(balance) / max) * 50);
  return (
    <div
      className="relative h-2.5 w-full rounded-full bg-surface ring-1 ring-line"
      aria-hidden="true"
    >
      <span className="absolute top-0 left-1/2 h-full w-px bg-line" />
      {balance !== 0 && (
        <span
          className={`absolute top-0 h-full rounded-full ${balance > 0 ? 'bg-mint-soft' : 'bg-pink-soft'}`}
          style={
            balance > 0 ? { left: '50%', width: `${pct}%` } : { right: '50%', width: `${pct}%` }
          }
        />
      )}
    </div>
  );
}
