import 'vitest';
import ms from 'ms';

declare module 'vitest' {
  interface ExpectStatic {
    todaysDate(): unknown;
    dateCloseTo(target: Date, tolerance?: ms.StringValue): unknown;
  }
}
