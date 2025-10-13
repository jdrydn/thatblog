import { ulid } from 'ulid';

import type { BlogItem, BlogBrandingItem, BlogDomainItem, BlogPreferencesItem } from '@/src/modules/blogs/models';

import type { PickRequiredPartial } from './index';

export function createBlog(create?: Partial<BlogItem>): BlogItem {
  return {
    blogId: ulid(),
    siteUrl: 'http://localhost:3000',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...create,
  };
}

export function createBlogBranding(create: PickRequiredPartial<BlogBrandingItem, 'blogId'>): BlogBrandingItem {
  return {
    title: 'Some Important Blog',
    updatedAt: new Date().toISOString(),
    ...create,
  };
}

export function createBlogDomain(create: PickRequiredPartial<BlogDomainItem, 'blogId'>): BlogDomainItem {
  return {
    domain: 'blog.someimportantcompany.com',
    path: '',
    ...create,
  };
}

export function createBlogPreferences(create: PickRequiredPartial<BlogPreferencesItem, 'blogId'>): BlogPreferencesItem {
  return {
    timezone: 'Etc/UTC',
    dateFormat: '1',
    timeFormat: '1',
    updatedAt: new Date().toISOString(),
    ...create,
  };
}

export const SomeImportantBlog = {
  Item: createBlog({
    blogId: '01K75BMCX3AB3GXCJTP05Z4QNB',
    siteUrl: 'http://localhost:3000',
  }),
  Branding: createBlogBranding({
    blogId: '01K75BMCX3AB3GXCJTP05Z4QNB',
  }),
  Domain: createBlogDomain({
    blogId: '01K75BMCX3AB3GXCJTP05Z4QNB',
    domain: 'localhost',
  }),
  Preferences: createBlogPreferences({
    blogId: '01K75BMCX3AB3GXCJTP05Z4QNB',
  }),
};
