export const $$typeof = Symbol.for('jest.asymmetricMatcher');

export type Asymmetric = {
  $$typeof: typeof $$typeof;
  asymmetricMatch(actual: unknown): boolean;
  toString?: () => string;
  getExpectedType?: () => string;
  toAsymmetricMatcher?: () => string;
};
