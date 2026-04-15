import { describe, test, expect } from 'vitest';

import { formatDate, DATE_FORMATS, TIME_FORMATS } from './datetime';

describe('#formatDate', () => {
  test('it should format a date', () => {
    const date = new Date('2025-10-13T22:00:00.000Z');
    const actual = formatDate(date, DATE_FORMATS[1]);
    expect(actual).toEqual('13th Oct, 2025');
  });
  test('it should format a time', () => {
    const date = new Date('2025-10-13T22:00:00.000Z');
    const actual = formatDate(date, TIME_FORMATS[1]);
    expect(actual).toEqual('10:00 pm');
  });
});
