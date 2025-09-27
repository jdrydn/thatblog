export function formatPrimaryKeyPair(key: object) {
  const { pk, sk } = typeof key === 'object' ? (key as Record<string, unknown>) : {};
  return typeof pk === 'string' && typeof sk === 'string' ? { pk, sk } : undefined;
}

export function formatPrimaryKeyPairs(keys: object[]): Array<NonNullable<ReturnType<typeof formatPrimaryKeyPair>>> {
  return keys.reduce((list: ReturnType<typeof formatPrimaryKeyPairs>, key) => {
    const parsed = formatPrimaryKeyPair(key);
    return list.concat(parsed ? [parsed] : []);
  }, []);
}

export function formatProjectionExpression(fields: string[]): [string, Record<string, string> | undefined] {
  const names: Record<string, string> = {};
  const cleaned = fields.map((field, i) => {
    names[`#pf${i + 1}`] = field;
    return `#pf${i + 1}`;
  });

  return [cleaned.join(', '), Object.keys(names).length ? names : undefined];
}
