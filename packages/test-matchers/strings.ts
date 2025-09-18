import { $$typeof, type Asymmetric } from './utils';

export function stringStartsWith(prefix: string): Asymmetric {
  return {
    $$typeof,
    asymmetricMatch(actual: unknown) {
      return typeof actual === 'string' && actual.startsWith(prefix);
    },
    toAsymmetricMatcher: () => `stringStartsWith("${prefix}")`,
    toString: () => `stringStartsWith("${prefix}")`,
    getExpectedType: () => 'string',
  };
}

export function stringEndsWith(suffix: string): Asymmetric {
  return {
    $$typeof,
    asymmetricMatch(actual: unknown) {
      return typeof actual === 'string' && actual.endsWith(suffix);
    },
    toAsymmetricMatcher: () => `stringEndsWith("${suffix}")`,
    toString: () => `stringEndsWith("${suffix}")`,
    getExpectedType: () => 'string',
  };
}

export function stringMatches(pattern: RegExp): Asymmetric {
  return {
    $$typeof,
    asymmetricMatch(actual: unknown) {
      return typeof actual === 'string' && pattern.test(actual);
    },
    toAsymmetricMatcher: () => `stringMatches("${pattern}")`,
    toString: () => `stringMatches("${pattern}")`,
    getExpectedType: () => 'string',
  };
}

export function stringIsULID(): Asymmetric {
  return {
    $$typeof,
    asymmetricMatch(actual: unknown) {
      const pattern = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/i;
      return typeof actual === 'string' && pattern.test(actual);
    },
    toAsymmetricMatcher: () => 'stringIsULID()',
    toString: () => 'stringIsULID()',
    getExpectedType: () => 'string',
  };
}

export function stringIsUUID(): Asymmetric {
  return {
    $$typeof,
    asymmetricMatch(actual: unknown) {
      const pattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;
      return typeof actual === 'string' && pattern.test(actual);
    },
    toAsymmetricMatcher: () => 'stringIsUUID()',
    toString: () => 'stringIsUUID()',
    getExpectedType: () => 'string',
  };
}
