import { v7 as uuid } from 'uuid';
import { z } from 'zod';

import { dcdb, tableName, createItem } from '@/backend-api/src/lib/dynamodb';

export interface User {
  // pk: 'USER:$USER-ID',
  // sk: 'USER',
  // ls1sk: 'CREATED:$CREATED-AT',
  // ls2sk: 'UPDATED:$UPDATED-AT',
  // ls3sk: 'DELETED:$DELETED-AT',

  // gs1pk: 'USERNAMES:ALL',
  // gs1sk: '$USERNAME',

  id: string; // pk
  createdAt: Date; // ls1sk
  updatedAt: Date; // ls2sk
  deletedAt?: Date | undefined; // ls3sk

  username: string; // gs2sk
  displayName?: string | undefined;
  publicEmail?: string | undefined;
  privateEmail: string;
}

const userSchema = z
  .object({
    id: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().optional(),

    username: z.string(),
    displayName: z.string().optional(),
    publicEmail: z.string().email().optional(),
    privateEmail: z.string().email(),
  })
  .required({
    id: true,
    createdAt: true,
    updatedAt: true,
    username: true,
  }) satisfies z.ZodType<User>;

const formatOnReadSchema = userSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    username: true,
  })
  .extend({
    pk: z
      .string()
      .startsWith('USER:')
      .transform((v) => z.string().uuid().parse(v.substring('CREATED:'.length))),
    sk: z.literal('USER'),
    ls1sk: z
      .string()
      .startsWith('CREATED:')
      .transform((v) => z.string().datetime().parse(v.substring('CREATED:'.length))),
    ls2sk: z
      .string()
      .startsWith('UPDATED:')
      .transform((v) => z.string().datetime().parse(v.substring('UPDATED:'.length))),
    ls3sk: z
      .string()
      .optional()
      .transform((v) => {
        if (v?.startsWith('COMPLETED:')) {
          return z.string().datetime().parse(v.substring('COMPLETED:'.length));
        } else {
          return undefined;
        }
      }),
    gs1pk: z.literal('USERNAMES:ALL'),
    gs1sk: z.string(),
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .transform(({ pk, sk, ls1sk, ls2sk, ls3sk, gs1pk, gs1sk, ...entry }) => ({
    id: pk,
    createdAt: new Date(ls1sk!),
    updatedAt: new Date(ls2sk),
    deletedAt: ls3sk ? new Date(ls3sk) : undefined,
    username: gs1sk,
    ...entry,
  }));

export async function createUser(create: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<User> {
  const userId = uuid();
  const now = new Date();

  const validated = userSchema
    .omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    })
    .transform(({ ...entry }) => ({
      ls1sk: `CREATED:${now.toISOString()}`,
      ls2sk: `UPDATED:${now.toISOString()}`,
      ...entry,
    }))
    .parse(create);

  const res = await createItem(dcdb, tableName, { pk: `USER:${userId}`, sk: 'USER' }, validated);
  return formatOnReadSchema.parse(res);
}
