import { blogDomains } from './model';

export async function getDefaultBlogId(): Promise<{ blogId: string; domain: string } | undefined> {
  const { data } = await blogDomains.query.byBlog({}).go({ limit: 1 });
  return data?.shift();
}

export async function getBlogByDomain(domain: string, path?: string): Promise<{ blogId: string; domain: string; path: string } | undefined> {
  const { data } = await blogDomains.query.byDomain({ domain, path }).go({})
  const found = data.find(({ path: prefix }) => path?.length ? path.startsWith(prefix) : prefix === '')
  return found
}
