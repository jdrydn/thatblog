// Shared attribute fragments spread into every entity's `attributes`. ISO strings so they sort
// lexically — this is the format the future Post LSIs (ls1sk=createdAt, ls2sk=updatedAt) rely on.
export const timestamps = {
  createdAt: {
    type: 'string',
    readOnly: true,
    required: true,
    default: () => new Date().toISOString(),
  },
  updatedAt: {
    type: 'string',
    required: true,
    watch: '*',
    default: () => new Date().toISOString(),
    set: () => new Date().toISOString(),
  },
} as const;
