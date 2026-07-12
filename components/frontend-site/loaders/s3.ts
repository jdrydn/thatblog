import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import type { TemplateLoader } from '@thatblog/renderer';

// The prod counterpart to renderer's fsLoader: theme templates live in the content bucket under a
// per-theme prefix (PLAN.md #14). LiquidJS's own template cache means each partial is fetched from S3
// once per warm container, then served from memory (PLAN.md section 9) — so this only issues S3 reads
// on a cold container. It lives here, not in @thatblog/renderer, to keep that package AWS-SDK-free.
export function s3Loader(client: S3Client, bucket: string, prefix: string): TemplateLoader {
  const key = (path: string) => `${prefix}/${path}`;

  return {
    async readFile(path) {
      const out = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key(path) }));
      return out.Body!.transformToString();
    },
    async exists(path) {
      try {
        await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key(path) }));
        return true;
      } catch {
        return false;
      }
    },
  };
}
