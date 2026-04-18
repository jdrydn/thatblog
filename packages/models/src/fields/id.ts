import isUUID from 'validator/es/lib/isUUID';
import { v7 as uuid } from 'uuid';
import type { StringAttribute } from 'electrodb';

export function createIdField(opts?: { required?: true; default?: true }): StringAttribute {
  return {
    type: 'string',
    required: opts?.required === true,
    default: opts?.default === true ? () => uuid() : undefined,
    validate: (id) => isUUID(id, 7),
  };
}
