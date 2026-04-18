import isISO8601 from 'validator/es/lib/isISO8601';
import type { StringAttribute } from 'electrodb';

export function createDateField(opts?: {
  required?: true;
  default?: true;
  watch?: StringAttribute['watch'];
}): StringAttribute {
  return {
    type: 'string',
    required: opts?.required === true,
    default: opts?.default === true ? () => new Date().toISOString() : undefined,
    watch: opts?.watch,
    set: (value) => value || new Date().toISOString(),
    validate: (value) => isISO8601(value),
  };
}
