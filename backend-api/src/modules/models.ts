import { Service } from 'electrodb';

import { dcdb, tableName } from '@/backend-api/src/lib/dynamodb';

import {
  blogBranding,
  type BlogBrandingItem,
  blogDomains,
  type BlogDomainItem,
  blogPreferences,
  type BlogPreferencesItem,
} from './blogs/model';
import { mapBlogsUsers, type MapBlogUserItem } from './map-blogs-users/model';
import { system, type SystemItem } from './system/model';
import { userProfiles, userSessions, type UserProfileItem, type UserSessionItem } from './users/model';

export {
  blogBranding,
  type BlogBrandingItem,
  blogDomains,
  type BlogDomainItem,
  blogPreferences,
  type BlogPreferencesItem,
  mapBlogsUsers,
  type MapBlogUserItem,
  system,
  type SystemItem,
  userProfiles,
  type UserProfileItem,
  userSessions,
  type UserSessionItem,
};

export const application = new Service(
  {
    blogBranding,
    blogDomains,
    blogPreferences,
    mapBlogsUsers,
    system,
    userProfiles,
    userSessions,
  },
  {
    client: dcdb,
    table: tableName,
  },
);
