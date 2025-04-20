import { Service } from 'electrodb';

import { dcdb, THATBLOG_DYNAMODB_TABLE } from '@/backend-api/src/lib/electrodb';

import { blogBranding, blogPreferences } from './blog/model';
import { userProfiles } from './user-profiles/model';
import { userSessions } from './user-sessions/model';

export { blogBranding, blogPreferences, userProfiles, userSessions };

export const models = new Service(
  {
    blogBranding,
    blogPreferences,
    userProfiles,
    userSessions,
  },
  {
    client: dcdb,
    table: THATBLOG_DYNAMODB_TABLE,
  },
);
