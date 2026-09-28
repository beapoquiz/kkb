import { formatMoney } from '../../../lib/money';
import { CATEGORIES, CATEGORY_META, type KkbEvent } from '../../../lib/schema';
import { allocate, expenseTotal } from '../../../lib/split';

/**
 * Spending by category as a sorted bar list. One series, so one hue and no legend: each bar
 * is labelled with its category and amount in text, which also makes it readable without color.
 */
export function CategoryBreakdown({ event }: { event: KkbEvent }) {
  const totals = CATEGORIES.map((category) => ({
    category,
    total: event.expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + expenseTotal(e), 0),
  }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);
  if (totals.length === 0) return null;
  const max = totals[0].total;
  // Largest-remainder rounding, so the percentages always add up to exactly 100.
  const percents = allocate(
    100,
    new Map(totals.map((c) => [c.category, c.total])),
    totals.map((c) => c.category),
  );

  return (
    <section aria-labelledby="categories-title" className="rounded-card bg-surface p-4 shadow-card">
      <h2 id="categories-title" className="mb-3 text-h2 font-medium">
        Where the money went
      </h2>
      <ul className="flex flex-col gap-3">
        {totals.map(({ category, total }) => {
          const meta = CATEGORY_META[category];
          const pct = percents.get(category) ?? 0;
          return (
            <li key={category}>
              <div className="mb-1 flex items-baseline justify-between gap-2 text-label">
                <span className="font-bold">
                  <span aria-hidden="true">{meta.emoji}</span> {meta.label}
                </span>
                <span className="tabular">
                  <span className="font-bold">{formatMoney(total, event.currency)}</span>{' '}
                  <span className="text-ink-muted">· {pct}%</span>
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-cream" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-blue"
                  style={{ width: `${Math.max(2, (total / max) * 100)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
