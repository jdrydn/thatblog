import { Service } from 'electrodb';

import { dcdb } from '@/src/services';
import { DYNAMODB_TABLENAME } from '@/src/config';

import {
  Blog,
  type BlogItem,
  BlogBranding,
  type BlogBrandingItem,
  BlogDomain,
  type BlogDomainItem,
  BlogPreferences,
  type BlogPreferencesItem,
} from './blogs/models';
import { MapBlogUser, type MapBlogUserItem } from './map-blog-user/models';
import { Post, type PostItem } from './posts/models';
import { System, type SystemItem } from './system/models';
import { User, UserSession, type UserItem, type UserSessionItem } from './users/models';

export {
  Blog,
  type BlogItem,
  BlogBranding,
  type BlogBrandingItem,
  BlogDomain,
  type BlogDomainItem,
  BlogPreferences,
  type BlogPreferencesItem,
  MapBlogUser,
  type MapBlogUserItem,
  Post,
  type PostItem,
  System,
  type SystemItem,
  User,
  type UserItem,
  UserSession,
  type UserSessionItem,
};

export const Application = new Service(
  {
    Blog,
    BlogBranding,
    BlogDomain,
    BlogPreferences,
    MapBlogUser,
    Post,
    System,
    User,
    UserSession,
  },
  {
    client: dcdb,
    table: DYNAMODB_TABLENAME,
  },
);
