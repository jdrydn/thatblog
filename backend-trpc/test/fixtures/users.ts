import { ulid } from 'ulid';

import { hashPasswordSync } from '@/backend-trpc/src/modules/authentication/passwords';
import type { UserProfileItem, UserSessionItem } from '@/backend-trpc/src/modules/users/models';

export function createUserProfile(create?: Partial<UserProfileItem>): UserProfileItem {
  return {
    userId: ulid(),
    name: 'Geoff Testington',
    email: 'geoff.testington@example.com',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...create,

    // Overwrite the password field if set
    password: create?.password ? hashPasswordSync(create.password) : undefined,
  };
}

export function createUserSession(create?: Partial<UserSessionItem>): UserSessionItem {
  return {
    userId: ulid(),
    sessionId: ulid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...create,
  };
}

export const GeoffTestingtonUserProfile = createUserProfile({
  userId: '01K4R0C93A9FSHD848Q4ZSBBM2',
  name: 'Geoff Testington',
  email: 'geoff.testington@example.com',
  password: 'hello-world-1',
});

export const GeoffTestingtonUserSession = createUserSession({
  userId: GeoffTestingtonUserProfile.userId,
  sessionId: '01K4R0CW4KW0MC9E1N5Q9J2GWB',
});
