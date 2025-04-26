import { blogDomains } from './model';

export async function getDefaultBlogId(): Promise<{ blogId: string; domain: string } | undefined> {
  const { data } = await blogDomains.query.byBlog({}).go({ limit: 1 });
  return data?.shift();
}
