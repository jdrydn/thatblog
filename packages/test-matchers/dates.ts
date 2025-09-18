import ms from 'ms';
import { $$typeof, type Asymmetric } from './utils';

export function dateCloseTo(target: Date, tolerance: ms.StringValue = '1s'): Asymmetric {
  return {
    $$typeof,
    asymmetricMatch(actual: unknown) {
      const date = actual instanceof Date ? actual : new Date(String(actual));
      if (isNaN(date as unknown as number)) return false;
      const diff = Math.abs(date.getTime() - target.getTime());
      return diff <= ms(tolerance);
    },
    toAsymmetricMatcher: () => `dateCloseTo("${target.toISOString()}", "±${tolerance}")`,
    toString: () => `dateCloseTo("${target.toISOString()}", "±${tolerance}")`,
    getExpectedType: () => 'date|string',
  };
}

export function dateIsToday(): Asymmetric {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();

  return {
    $$typeof,
    asymmetricMatch(actual: unknown) {
      const date = actual instanceof Date ? actual : new Date(String(actual));
      return (
        !isNaN(date as unknown as number) && date.getFullYear() === y && date.getMonth() === m && date.getDate() === d
      );
    },
    toAsymmetricMatcher: () => 'dateIsToday()',
    toString: () => 'dateIsToday()',
    getExpectedType: () => 'date|string',
  };
}
