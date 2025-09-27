import { Service } from 'electrodb';

import { dcdb } from '@/backend-api/src/services';
import { DYNAMODB_TABLENAME } from '@/backend-api/src/config';

import {
  BlogBranding,
  type BlogBrandingItem,
  BlogDomain,
  type BlogDomainItem,
  BlogPreferences,
  type BlogPreferencesItem,
} from './blogs/models';
import { MapBlogUser, type MapBlogUserItem } from './map-blog-user/models';
import { System, type SystemItem } from './system/models';
import { UserProfile, UserSession, type UserProfileItem, type UserSessionItem } from './users/models';

export {
  BlogBranding,
  type BlogBrandingItem,
  BlogDomain,
  type BlogDomainItem,
  BlogPreferences,
  type BlogPreferencesItem,
  MapBlogUser,
  type MapBlogUserItem,
  System,
  type SystemItem,
  UserProfile,
  type UserProfileItem,
  UserSession,
  type UserSessionItem,
};

export const Application = new Service(
  {
    BlogBranding,
    BlogDomain,
    BlogPreferences,
    MapBlogUser,
    System,
    UserProfile,
    UserSession,
  },
  {
    client: dcdb,
    table: DYNAMODB_TABLENAME,
  },
);
