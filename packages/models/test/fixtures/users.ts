import { ulid } from 'ulid';

import { hashPasswordSync } from '@/src/modules/authentication/passwords';
import type { UserItem, UserSessionItem } from '@/src/modules/users/models';

export function createUser(create?: Partial<UserItem>): UserItem {
  return {
    userId: ulid(),
    name: 'Geoff Testington',
    email: 'geoff.testington@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...create,

    // Overwrite the password field if set
    password: create?.password ? hashPasswordSync(create.password) : undefined,
  };
}

export function createUserSession(create?: Partial<UserSessionItem>): UserSessionItem {
  return {
    userId: ulid(),
    sessionId: ulid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...create,
  };
}

export const GeoffTestingtonUser = {
  Item: createUser({
    userId: '01K4R0C93A9FSHD848Q4ZSBBM2',
    name: 'Geoff Testington',
    email: 'geoff.testington@example.com',
    password: 'hello-world-1',
  }),
  Session: createUserSession({
    userId: '01K4R0C93A9FSHD848Q4ZSBBM2',
    sessionId: '01K4R0CW4KW0MC9E1N5Q9J2GWB',
  }),
};
