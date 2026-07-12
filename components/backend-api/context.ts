import type { EntityItem } from 'electrodb';
import type { Models } from './models';
import type { Loaders } from './loaders';
import type { UserEntity } from './models/user';
import type { UserSessionEntity } from './models/user-session';
import type { MapBlogUserEntity } from './models/map-blog-user';

// Hono per-request variables. `models`/`loaders` are set for every request by the app middleware;
// `user`/`session` are set only after requireAuth, and `membership` only after requireBlogMember, so
// the handlers behind each gate can read them non-optionally.
export type AppEnv = {
  Variables: {
    models: Models;
    loaders: Loaders;
    user: EntityItem<UserEntity>;
    session: EntityItem<UserSessionEntity>;
    membership: EntityItem<MapBlogUserEntity>;
  };
};
