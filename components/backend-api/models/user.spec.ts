import { describe, expect, it } from 'vitest';
import { testModels } from '../../../test/dynamo';
import { newUserId } from './ids';

const { User } = testModels();

describe('User', () => {
  it('looks up a user by email via gs1 (login), then hydrates', async () => {
    const userId = newUserId();
    const email = `${userId}@example.com`;
    await User.put({ userId, email, passwordHash: 'bcrypt-hash', displayName: 'Jane' }).go();

    // gs1 is KEYS_ONLY: includeKeys surfaces the routing key, ignoreOwnership skips the ownership
    // stamp check (not projected). The key carries the userId, which we hydrate (plan 8.1).
    const { data } = await User.query.byEmail({ email }).go({ ignoreOwnership: true, data: 'includeKeys' });
    expect(data).toHaveLength(1);
    // includeKeys surfaces the raw key fields at runtime; ElectroDB doesn't model them in the type.
    expect((data[0] as unknown as { pk: string }).pk).toBe(`USERS#${userId}`);

    const hydrated = await User.get({ userId }).go();
    expect(hydrated.data?.email).toBe(email);
    expect(hydrated.data?.displayName).toBe('Jane');
  });
});
