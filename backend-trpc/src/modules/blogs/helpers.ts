import { BlogDomain, type BlogItem, type BlogBrandingItem, type BlogPreferencesItem } from './models';

export async function getDefaultBlogId(): Promise<{ blogId: string; domain: string } | undefined> {
  const { data } = await BlogDomain.query.byBlog({}).go({ limit: 1 });
  return data?.shift();
}

export async function getBlogByDomainPath(
  domain: string,
  path?: string,
): Promise<{ blogId: string; domain: string; path: string } | undefined> {
  const { data } = await BlogDomain.query.byDomain({ domain, path }).go({});
  const found = data.find(({ path: prefix }) => (path?.length ? path.startsWith(prefix) : prefix === ''));
  return found;
}

export function formatBlog({
  blog,
  branding,
  preferences,
}: {
  blog: BlogItem;
  branding?: BlogBrandingItem;
  preferences?: BlogPreferencesItem;
}) {
  return {
    id: blog.blogId,
    siteUrl: blog.siteUrl,
    branding: branding
      ? {
          title: branding.title,
          description: branding.description,
        }
      : undefined,
    preferences: preferences
      ? {
          timezone: preferences.timezone,
          dateFormat: preferences.dateFormat,
          timeFormat: preferences.timeFormat,
        }
      : undefined,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  };
}
