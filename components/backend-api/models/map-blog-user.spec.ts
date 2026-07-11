import { describe, expect, it } from 'vitest';
import { testModels } from '../../../test/dynamo';
import { newBlogId, newUserId } from './ids';

const { MapBlogUser } = testModels();

describe('MapBlogUser', () => {
  it("lists a blog's team (primary) and my blogs (gs1) from one membership (#13)", async () => {
    const blogId = newBlogId();
    const userId = newUserId();
    await MapBlogUser.put({ blogId, userId, role: 'owner' }).go();

    // A blog's team — primary index, base table, so the role comes back.
    const team = await MapBlogUser.query.primary({ blogId }).go();
    expect(team.data.map((m) => m.userId)).toContain(userId);
    expect(team.data[0]?.role).toBe('owner');

    // "My blogs" — gs1 in the other direction. KEYS_ONLY → includeKeys + ignoreOwnership; the key
    // carries the blogId back.
    const mine = await MapBlogUser.query.byUser({ userId }).go({ ignoreOwnership: true, data: 'includeKeys' });
    // includeKeys surfaces the raw key fields at runtime; ElectroDB doesn't model them in the type.
    expect(mine.data.map((m) => (m as unknown as { gs1sk: string }).gs1sk)).toContain(`BLOGS#${blogId}`);
  });
});
