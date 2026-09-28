import { SAMPLE_IDS, buildSampleTrip } from './fixtures/sampleTrip';
import type { KkbEvent } from './schema';
import { settleEvent } from './settle';
import { buildPersonalSummary, buildSummary } from './summary';

const trip = buildSampleTrip();
const url = 'https://beapoquiz.github.io/kkb/#/s/abc';

function settled(event: KkbEvent): KkbEvent {
  const extra = settleEvent(event).map((t, i) => ({ id: `s${i}`, ...t, paidAt: 0 }));
  return { ...event, payments: [...event.payments, ...extra] };
}

describe('buildSummary', () => {
  it('matches the group chat format for the sample trip', () => {
    expect(buildSummary(trip, url)).toBe(
      [
        '🐟 KKB — Baguio Barkada Trip',
        'Total spent: ₱13,110.00 (4 people)',
        '',
        'To settle up:',
        '• Janna → Bea: ₱2,012.08 (GCash 0917 000 0001)',
        '• Carlo → Bea: ₱1,675.08 (GCash 0917 000 0001)',
        '• Migs → Bea: ₱31.75 (GCash 0917 000 0001)',
        '✅ Paid: Janna → Bea ₱500.00',
        '',
        `Open the full breakdown: ${url}`,
      ].join('\n'),
    );
  });

  it('says everyone is even once settled', () => {
    const text = buildSummary(settled(trip), url);
    expect(text).toContain("Everyone's even! 🎉");
    expect(text).not.toContain('To settle up');
    expect(text.match(/✅ Paid/g)).toHaveLength(4);
  });

  it('omits handles and paid lines when there are none', () => {
    const plain: KkbEvent = {
      ...trip,
      people: trip.people.map(({ payment: _payment, ...p }) => p),
      payments: [],
    };
    expect(buildSummary(plain, url)).toMatchInlineSnapshot(`
      "🐟 KKB — Baguio Barkada Trip
      Total spent: ₱13,110.00 (4 people)

      To settle up:
      • Janna → Bea: ₱2,512.08
      • Carlo → Bea: ₱1,675.08
      • Migs → Bea: ₱31.75

      Open the full breakdown: https://beapoquiz.github.io/kkb/#/s/abc"
    `);
  });

  it('uses the singular for one person', () => {
    const solo: KkbEvent = { ...trip, people: [trip.people[0]], expenses: [], payments: [] };
    expect(buildSummary(solo, url)).toContain('(1 person)');
  });
});

describe('buildPersonalSummary', () => {
  const { bea, migs } = SAMPLE_IDS;

  it('describes what someone owes, with the handle', () => {
    expect(buildPersonalSummary(trip, migs)).toBe(
      'KKB — Baguio Barkada Trip: I owe Bea ₱31.75 (GCash 0917 000 0001)',
    );
  });

  it('describes what someone gets back', () => {
    expect(buildPersonalSummary(trip, bea)).toBe('KKB — Baguio Barkada Trip: I get back ₱3,718.91');
  });

  it('describes being all square', () => {
    expect(buildPersonalSummary(settled(trip), migs)).toBe(
      "KKB — Baguio Barkada Trip: I'm all square 🎉",
    );
  });
});
