import { Service } from 'electrodb';

import { dcdb, THATBLOG_DYNAMODB_TABLE } from '@/backend-api/src/lib/electrodb';

import { blogBranding, blogDomains, blogPreferences } from './blogs/model';
import { userProfiles } from './user-profiles/model';
import { userSessions } from './user-sessions/model';

export { blogBranding, blogDomains, blogPreferences, userProfiles, userSessions };

export const models = new Service(
  {
    blogBranding,
    blogDomains,
    blogPreferences,
    userProfiles,
    userSessions,
  },
  {
    client: dcdb,
    table: THATBLOG_DYNAMODB_TABLE,
  },
);
