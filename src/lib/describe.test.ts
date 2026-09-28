import { balanceText, describeExpense } from './describe';
import { SAMPLE_IDS, buildSampleTrip } from './fixtures/sampleTrip';

const trip = buildSampleTrip();

describe('describeExpense', () => {
  it('describes equal, itemized and personal expenses', () => {
    expect(describeExpense(trip, trip.expenses[0])).toBe('Migs paid · split 4 ways');
    expect(describeExpense(trip, trip.expenses[2])).toBe('Carlo paid · itemized · 4 people');
    expect(describeExpense(trip, trip.expenses[3])).toBe('Janna paid · split 3 ways');
    const personal = { ...trip.expenses[0], participants: [SAMPLE_IDS.migs] };
    expect(describeExpense(trip, personal)).toBe('Migs paid · (personal)');
  });
});

describe('balanceText', () => {
  it('reads naturally', () => {
    expect(balanceText(371891, 'PHP')).toBe('gets back ₱3,718.91');
    expect(balanceText(-3175, 'PHP')).toBe('owes ₱31.75');
    expect(balanceText(0, 'PHP')).toBe('all square');
  });
});
