import * as strings from './strings';
import * as dates from './dates';

export * from './strings';
export * from './dates';

export default {
  ...strings,
  ...dates,
};
