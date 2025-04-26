import type { Entity, EntityIdentifiers, EntityItem } from 'electrodb';

export async function getAllByBatch<E extends Entity<any, any, any, any>>(
  model: E,
  keys: EntityIdentifiers<E>[],
): Promise<EntityItem<E>[]> {
  const items: EntityItem<E>[] = [];
  let unprocessed = [...keys];

  do {
    const results = (await model.get(unprocessed).go()) as never as {
      data: EntityItem<E>[] | null;
      unprocessed: EntityIdentifiers<E>[];
    };
    items.push(...(results.data ?? []));
    unprocessed = results.unprocessed;
  } while (unprocessed.length > 0);

  return items;
}

type QueryFn<T> = (cursor: string | null) => Promise<{ data: T[]; cursor: typeof cursor }>;

export async function getAllByQuery<T>(i: QueryFn<T>): Promise<T[]> {
  const items: T[] = [];
  let cursor: string | null = null;

  do {
    const results = await i(cursor);
    items.push(...results.data);
    cursor = results.cursor;
  } while (cursor !== null);

  return items;
}
