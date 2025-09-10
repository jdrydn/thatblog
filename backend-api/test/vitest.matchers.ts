import ms from 'ms';
import { expect } from 'vitest';

const JEST_ASYM = Symbol.for('jest.asymmetricMatcher');

export type Asymmetric = {
  $$typeof: typeof JEST_ASYM;
  asymmetricMatch(actual: unknown): boolean;
  toString?: () => string;
  getExpectedType?: () => string;
  toAsymmetricMatcher?: () => string;
};

export function todaysDate(): Asymmetric {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();

  return {
    $$typeof: JEST_ASYM,
    asymmetricMatch(actual: unknown) {
      const date = actual instanceof Date ? actual : new Date(String(actual));
      return (
        !isNaN(date as unknown as number) && date.getFullYear() === y && date.getMonth() === m && date.getDate() === d
      );
    },
    toAsymmetricMatcher: () => 'todaysDate()',
    toString: () => 'todaysDate()',
    getExpectedType: () => 'date|string',
  };
}

export function dateCloseTo(target: Date, tolerance: ms.StringValue = '1s'): Asymmetric {
  return {
    $$typeof: JEST_ASYM,
    asymmetricMatch(actual: unknown) {
      const date = actual instanceof Date ? actual : new Date(String(actual));
      if (isNaN(date as unknown as number)) return false;
      const diff = Math.abs(date.getTime() - target.getTime());
      return diff <= ms(tolerance);
    },
    toAsymmetricMatcher: () => `dateCloseTo(${target.toISOString()}, ±${tolerance})`,
    toString: () => `dateCloseTo(${target.toISOString()}, ±${tolerance})`,
    getExpectedType: () => 'date|string',
  };
}

Object.assign(expect, {
  todaysDate,
  dateCloseTo,
});
