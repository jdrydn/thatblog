import { Service } from 'electrodb';

import { dcdb, DYNAMODB_TABLE } from '../setup';

import { Blog, type BlogItem } from './blog';
import { BlogBranding, type BlogBrandingItem } from './blog-branding';
import { BlogDomain, type BlogDomainItem } from './blog-domains';
import { BlogPreferences, type BlogPreferencesItem } from './blog-preferences';

import { MapBlogUser, type MapBlogUserItem } from './map-blog-user';
import { Post, type PostItem } from './post';
import { System, type SystemItem } from './system';
import { User, type UserItem } from './user';
import { UserSession, type UserSessionItem } from './user-session';
import type { PostContentItem, PostContentItemWithId, PostContentType } from './post-content';

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
  type PostContentItem,
  type PostContentItemWithId,
  type PostContentType,
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
    table: DYNAMODB_TABLE,
  },
);
