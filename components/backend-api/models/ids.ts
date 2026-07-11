import { nanoid } from 'nanoid';

// ID formats (PLAN.md decision #16). blogId is b-prefixed so it's recognisable in keys/logs;
// userId is an opaque nanoid; sessionId gets extra entropy — it's a cookie-carried secret component.
export const newBlogId = () => `b${nanoid()}`;
export const newUserId = () => nanoid();
export const newSessionId = () => nanoid(32);
