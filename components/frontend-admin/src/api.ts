// Thin client over the backend-api JSON surface (served from the same origin under /api, PLAN.md #2).
// credentials:'include' sends the signed session cookie the API issues on login. Any non-2xx throws an
// ApiError carrying the status so callers can branch (401 → show login) without parsing bodies twice.
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: init?.body ? { 'content-type': 'application/json' } : undefined,
    ...init,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => undefined)) as { error?: string } | undefined;
    throw new ApiError(res.status, body?.error ?? res.statusText);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export type User = { userId: string; email: string; displayName?: string };
export type Blog = { blogId: string; name: string; role: string };
export type Post = {
  postId: string;
  slug?: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
};

export const api = {
  me: () => request<{ user: User }>('/auth/me'),
  login: (email: string, password: string) =>
    request<{ user: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request<{ ok: true }>('/auth/logout', { method: 'POST' }),
  blogs: () => request<{ blogs: Blog[] }>('/blogs'),
  listPosts: (blogId: string) => request<{ posts: Post[] }>(`/blogs/${blogId}/posts`),
  createPost: (blogId: string, value: string) =>
    request<{ post: Post }>(`/blogs/${blogId}/posts`, {
      method: 'POST',
      body: JSON.stringify({ type: 'short', blocks: [{ type: 'PLAIN_TEXT', value }] }),
    }),
  publishPost: (blogId: string, postId: string) =>
    request<{ post: Post }>(`/blogs/${blogId}/posts/${postId}/publish`, { method: 'POST', body: '{}' }),
};
