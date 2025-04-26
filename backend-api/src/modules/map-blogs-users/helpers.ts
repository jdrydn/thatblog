import { mapBlogsUsers, type MapBlogUserItem } from './model';

export async function listAllUsersForBlog(blogId: string): Promise<MapBlogUserItem[]> {
  const items: MapBlogUserItem[] = [];
  let cursor: string | null = null;

  do {
    const results = await mapBlogsUsers.query.byBlog({ blogId }).go();
    items.push(...results.data);
    cursor = results.cursor;
  } while (cursor !== null);

  return items;
}

export async function listAllBlogsForUserId(userId: string): Promise<MapBlogUserItem[]> {
  const items: MapBlogUserItem[] = [];
  let cursor: string | null = null;

  do {
    const results = await mapBlogsUsers.query.byUser({ userId }).go();
    items.push(...results.data);
    cursor = results.cursor;
  } while (cursor !== null);

  return items;
}
