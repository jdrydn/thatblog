import { Service } from 'electrodb';

import { dcdb, DYNAMODB_TABLE } from './setup';

import { Blog, type BlogItem } from './blogs';
import { BlogBranding, type BlogBrandingItem } from './blog-branding';
import { BlogDomain, type BlogDomainItem } from './blog-domains';
import { BlogPreferences, type BlogPreferencesItem } from './blog-preferences';

// import { MapBlogUser, type MapBlogUserItem } from './map-blog-user/models';
// import { Post, type PostItem } from './posts/models';
// import { System, type SystemItem } from './system/models';
// import { User, UserSession, type UserItem, type UserSessionItem } from './users/models';

export {
  Blog,
  type BlogItem,
  BlogBranding,
  type BlogBrandingItem,
  BlogDomain,
  type BlogDomainItem,
  BlogPreferences,
  type BlogPreferencesItem,
  // MapBlogUser,
  // type MapBlogUserItem,
  // Post,
  // type PostItem,
  // System,
  // type SystemItem,
  // User,
  // type UserItem,
  // UserSession,
  // type UserSessionItem,
};

export const Application = new Service(
  {
    Blog,
    BlogBranding,
    BlogDomain,
    BlogPreferences,
    // MapBlogUser,
    // Post,
    // System,
    // User,
    // UserSession,
  },
  {
    client: dcdb,
    table: DYNAMODB_TABLE,
  },
);
