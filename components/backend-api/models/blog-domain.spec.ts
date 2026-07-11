import { describe, expect, it } from 'vitest';
import { testModels } from '../../../test/dynamo';
import { newBlogId } from './ids';

const { BlogDomain } = testModels();

describe('BlogDomain', () => {
  it('resolves a host to its blog via gs1, then hydrates from the returned key (#15, 8.1)', async () => {
    const blogId = newBlogId();
    const host = `${blogId}.example.com`;
    await BlogDomain.put({ blogId, host, type: 'primary' }).go();

    // Public routing: query gs1 by host. gs1 is KEYS_ONLY, so the read returns only keys — hence
    // data: 'includeKeys' (to surface them) + ignoreOwnership: true (the __edb_e__ stamp isn't
    // projected either). The routing key carries the blogId, which we then hydrate (plan 8.1).
    const { data } = await BlogDomain.query.byHost({ host }).go({ ignoreOwnership: true, data: 'includeKeys' });
    expect(data).toHaveLength(1);
    // includeKeys surfaces the raw key fields at runtime; ElectroDB doesn't model them in the type.
    expect((data[0] as unknown as { gs1sk: string }).gs1sk).toBe(`BLOGS#${blogId}`);

    const hydrated = await BlogDomain.get({ blogId, host }).go();
    expect(hydrated.data?.type).toBe('primary');
    expect(hydrated.data?.status).toBe('active'); // default applied
  });
});
