import { S3Client } from '@aws-sdk/client-s3';
import { createRenderer, type Renderer } from '@thatblog/renderer';
import { s3Loader } from './loaders/s3';

// The one shipped theme (PLAN.md section 9). Per-blog theme install/activation is deferred to 0.1.6,
// so v0.0.5 renders every blog from the catalog copy synced at deploy (themes/ → themes/_catalog/,
// see infra/deploy.sh) rather than a blog's own themes/{blogId}/ prefix. When the Theme entity lands,
// this prefix becomes `themes/${blogId}/${blog.activeThemeId}`.
export const DEFAULT_THEME = 'microblog';

// A single renderer for the warm container: all blogs share the catalog theme in v0.0.5, and LiquidJS
// caches parsed templates on the instance, so building one at module load keeps cold-start S3 reads to
// a minimum. CONTENT_BUCKET is injected by SAM (infra/template.yaml).
export function defaultRenderer(): Renderer {
  const bucket = process.env.CONTENT_BUCKET;
  if (!bucket) throw new Error('CONTENT_BUCKET is not set');
  return createRenderer(s3Loader(new S3Client({}), bucket, `themes/_catalog/${DEFAULT_THEME}`));
}
