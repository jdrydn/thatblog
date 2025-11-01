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

export function createBlogBranding(
  create: PickRequiredPartial<BlogBrandingItem, 'blogId' | 'title'>,
): BlogBrandingItem {
  return {
    updatedAt: new Date().toISOString(),
    ...create,
  };
}

export function createBlogDomain(create: PickRequiredPartial<BlogDomainItem, 'blogId' | 'domain'>): BlogDomainItem {
  return {
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

export const LocalhostBlog = {
  Item: createBlog({
    blogId: '01K90355QCQ64FWD9RZSC4JXMT',
    siteUrl: 'http://localhost:3000',
  }),
  Branding: createBlogBranding({
    blogId: '01K90355QCQ64FWD9RZSC4JXMT',
    title: 'Some Important Blog',
  }),
  Domain: createBlogDomain({
    blogId: '01K90355QCQ64FWD9RZSC4JXMT',
    domain: 'localhost',
  }),
  Preferences: createBlogPreferences({
    blogId: '01K90355QCQ64FWD9RZSC4JXMT',
  }),
};

export const SomeImportantBlog = {
  Item: createBlog({
    blogId: '01K75BMCX3AB3GXCJTP05Z4QNB',
    siteUrl: 'https://blog.someimportantcompany.com',
  }),
  Branding: createBlogBranding({
    blogId: '01K75BMCX3AB3GXCJTP05Z4QNB',
    title: 'Some Important Blog',
  }),
  Domain: createBlogDomain({
    blogId: '01K75BMCX3AB3GXCJTP05Z4QNB',
    domain: 'blog.someimportantcompany.com',
  }),
  Preferences: createBlogPreferences({
    blogId: '01K75BMCX3AB3GXCJTP05Z4QNB',
    timezone: 'Europe/London',
  }),
};
