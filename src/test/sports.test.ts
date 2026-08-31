import { describe, it, expect } from 'vitest';
import { normalizeSportName, dedupeSportNames, sportNamesMatch } from '@/lib/events';

describe('sport normalization', () => {
  it('unifies equivalent names for the same sport', () => {
    expect(normalizeSportName('futbol')).toBe('Fútbol');
    expect(normalizeSportName(' Fútbol ')).toBe('Fútbol');
    expect(normalizeSportName('futbol sala')).toBe('Fútbol Sala');
  });

  it('removes duplicated sport names from the catalog and matches equivalent filters', () => {
    expect(dedupeSportNames(['Fútbol', 'futbol', ' Futbol ', 'Baloncesto', 'baloncesto'])).toEqual(['Baloncesto', 'Fútbol']);
    expect(sportNamesMatch('futbol', 'Fútbol')).toBe(true);
    expect(sportNamesMatch('futbol sala', 'Fútbol Sala')).toBe(true);
  });
});
