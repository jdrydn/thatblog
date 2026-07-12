import { S3Client } from '@aws-sdk/client-s3';
import { s3Loader } from './loaders/s3';

// The admin SPA's entry HTML lives in the content bucket at admin/index.html (synced by deploy.sh).
// frontend-site serves it at /admin — the bare path the S3 proxy's /admin/{proxy+} route can't catch
// (no segment for the greedy var) — so the browser gets the app on a clean /admin URL, and its hashed
// assets then load straight from S3 via /admin/{proxy+}. Reuses s3Loader (readFile) scoped to admin/.
// CONTENT_BUCKET is injected by SAM (infra/template.yaml). Kept out of app.ts so the tests inject a
// fake index without an S3 client (mirrors defaultRenderer / theme.ts).
export function adminIndexHtml(): () => Promise<string> {
  const bucket = process.env.CONTENT_BUCKET;
  if (!bucket) throw new Error('CONTENT_BUCKET is not set');
  const loader = s3Loader(new S3Client({}), bucket, 'admin');
  return () => loader.readFile('index.html');
}
