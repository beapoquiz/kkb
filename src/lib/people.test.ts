import { buildSampleTrip, SAMPLE_IDS } from './fixtures/sampleTrip';
import { eventColor, findDuplicate, nextAvatar, normalizeName, personUsage } from './people';
import { AVATAR_COLORS } from './schema';

describe('people helpers', () => {
  const trip = buildSampleTrip();

  it('cycles avatars and colors', () => {
    expect(nextAvatar([])).toEqual({ emoji: '🐱', color: '#FFC8DD' });
    const eight = Array.from({ length: 8 }, () => ({
      emoji: '🐱' as const,
      color: '#FFC8DD' as const,
    }));
    expect(nextAvatar(eight).color).toBe('#FFC8DD');
    expect(nextAvatar(eight).emoji).toBe('🐧');
  });

  it('finds duplicates case-insensitively, ignoring extra spaces', () => {
    expect(findDuplicate(trip.people, '  bea ')?.name).toBe('Bea');
    expect(findDuplicate(trip.people, 'BEA', SAMPLE_IDS.bea)).toBeUndefined();
    expect(findDuplicate(trip.people, 'Ella')).toBeUndefined();
    expect(normalizeName('  Mary   Ann ')).toBe('Mary Ann');
  });

  it('counts where a person is used', () => {
    expect(personUsage(trip, SAMPLE_IDS.migs)).toEqual({ expenses: 3, payments: 0 });
    expect(personUsage(trip, SAMPLE_IDS.janna)).toEqual({ expenses: 4, payments: 1 });
    expect(personUsage(trip, 'nobody')).toEqual({ expenses: 0, payments: 0 });
  });

  it('derives a stable pastel per event', () => {
    expect(eventColor('abc')).toBe(eventColor('abc'));
    expect(AVATAR_COLORS).toContain(eventColor('sample-baguio'));
  });
});
