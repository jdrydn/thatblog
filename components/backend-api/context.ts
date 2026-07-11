import type { EntityItem } from 'electrodb';
import type { Models } from './models';
import type { Loaders } from './loaders';
import type { UserEntity } from './models/user';
import type { UserSessionEntity } from './models/user-session';

// Hono per-request variables. `models`/`loaders` are set for every request by the app middleware;
// `user`/`session` are set only after requireAuth, so protected handlers can read them non-optionally.
export type AppEnv = {
  Variables: {
    models: Models;
    loaders: Loaders;
    user: EntityItem<UserEntity>;
    session: EntityItem<UserSessionEntity>;
  };
};
