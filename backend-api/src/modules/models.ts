import { Service } from 'electrodb';

import { dcdb, tableName } from '@/backend-api/src/lib/dynamodb';

import { blogBranding, blogDomains, blogPreferences } from './blogs/model';
import { userProfiles } from './user-profiles/model';
import { userSessions } from './user-sessions/model';

export { blogBranding, blogDomains, blogPreferences, userProfiles, userSessions };

export const application = new Service(
  {
    blogBranding,
    blogDomains,
    blogPreferences,
    userProfiles,
    userSessions,
  },
  {
    client: dcdb,
    table: tableName,
  },
);
