import { describe, expect, it } from 'vitest';
import { testModels } from '../../../test/dynamo';
import { newUserId } from '../models/ids';
import { makeLoaders } from './index';

const models = testModels();

describe('loaders.userByEmail', () => {
  it('hydrates users by email via gs1 and maps unknown emails to undefined', async () => {
    const loaders = makeLoaders(models);
    const [a, b] = [newUserId(), newUserId()];
    const emailA = `${a}@example.com`;
    const emailB = `${b}@example.com`;
    await models.User.create({ userId: a, email: emailA, passwordHash: 'x', displayName: 'A' }).go();
    await models.User.create({ userId: b, email: emailB, passwordHash: 'y', displayName: 'B' }).go();

    // Three loads in one tick → one batch (N gs1 queries + a single BatchGet).
    const [ua, ub, missing] = await Promise.all([
      loaders.userByEmail.load(emailA),
      loaders.userByEmail.load(emailB),
      loaders.userByEmail.load('nobody@example.com'),
    ]);

    expect(ua?.userId).toBe(a);
    expect(ub?.displayName).toBe('B');
    expect(missing).toBeUndefined();
  });

  it('dedupes a repeated email within a request', async () => {
    const loaders = makeLoaders(models);
    const id = newUserId();
    const email = `${id}@example.com`;
    await models.User.create({ userId: id, email, passwordHash: 'x', displayName: 'Dup' }).go();

    const [one, two] = await Promise.all([loaders.userByEmail.load(email), loaders.userByEmail.load(email)]);
    expect(one).toBe(two); // same cached reference
  });
});
