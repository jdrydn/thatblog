import { nanoid } from 'nanoid';

// ID formats (PLAN.md decision #16). blogId is b-prefixed so it's recognisable in keys/logs;
// userId is an opaque nanoid; sessionId gets extra entropy — it's a cookie-carried secret component.
export const newBlogId = () => `b${nanoid()}`;
export const newUserId = () => nanoid();
export const newSessionId = () => nanoid(32);
// postId is p-prefixed so it reads clearly in keys/logs (like blogId). Content block ids are opaque
// (PLAN.md 8.2) — they only ever appear as a block's sk and inside Post.content.values.
export const newPostId = () => `p${nanoid()}`;
