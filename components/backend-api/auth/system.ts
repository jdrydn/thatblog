import { randomBytes } from 'node:crypto';
import type { EntityItem } from 'electrodb';
import type { Models } from '../models';
import type { SystemEntity } from '../models/system';

type SystemItem = EntityItem<SystemEntity>;

const newSecret = () => randomBytes(32).toString('base64url');
const newSetupKey = () => randomBytes(24).toString('base64url');

// Lazy first-run bootstrap (PLAN.md 10.1, #18). The System singleton isn't seeded at deploy time, so
// the first request that needs it creates it: one session secret + a one-time setupKey. The setup URL
// is logged (the operator reads it from CloudWatch) — the key is never exposed over the API. Setup
// clears the key, permanently disabling the route.
export async function ensureSystem(models: Models): Promise<SystemItem> {
  const existing = await models.System.get({}).go();
  if (existing.data) return existing.data;

  const setupKey = newSetupKey();
  try {
    const { data } = await models.System.create({ sessionSecrets: [newSecret()], setupKey }).go();
    console.log(`[thatblog] first-run setup required — POST /admin/setup/${setupKey}`);
    return data;
  } catch (err) {
    // Lost a create race with a concurrent cold start; the winner's row is now present.
    const raced = await models.System.get({}).go();
    if (raced.data) return raced.data;
    throw err;
  }
}
