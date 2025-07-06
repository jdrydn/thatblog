import { mapBlogsUsers, type MapBlogUserItem } from './model';

export async function listAllUsersForBlog(blogId: string): Promise<MapBlogUserItem[]> {
  const { data } = await mapBlogsUsers.query.byBlog({ blogId }).go({ pages: 'all' });
  return data
}

export async function listAllBlogsForUserId(userId: string): Promise<MapBlogUserItem[]> {
  const { data } = await mapBlogsUsers.query.byUser({ userId }).go({ pages: 'all' });
  return data
}
