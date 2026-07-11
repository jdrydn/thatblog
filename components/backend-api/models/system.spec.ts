import { describe, expect, it } from 'vitest';
import { testModels } from '../../../test/dynamo';

const { System } = testModels();

describe('System', () => {
  it('stores session secrets + a setup key and reads them back', async () => {
    await System.put({ sessionSecrets: ['secret-1'], setupKey: 'setup-abc' }).go();

    const { data } = await System.get({}).go();
    expect(data?.sessionSecrets).toEqual(['secret-1']);
    expect(data?.setupKey).toBe('setup-abc');
    expect(data).not.toHaveProperty('pk');
    expect(data).not.toHaveProperty('sk');
  });

  it('clears the setup key once setup completes (#18)', async () => {
    await System.put({ sessionSecrets: ['secret-1'], setupKey: 'setup-abc' }).go();
    await System.update({}).remove(['setupKey']).go();

    const { data } = await System.get({}).go();
    expect(data?.setupKey).toBeUndefined();
  });
});
