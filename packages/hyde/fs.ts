import assert from 'assert';
import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import type { FS } from 'liquidjs';

export function createS3FS(): FS {
  const { S3_BUCKET, HYDE_TEMPLATE_CACHE_DIR } = process.env;
  assert(S3_BUCKET, 'Missing { S3_BUCKET } env');

  const s3 = new S3Client();
  const cacheDir = HYDE_TEMPLATE_CACHE_DIR ? path.resolve(process.env.PWD ?? '/', HYDE_TEMPLATE_CACHE_DIR) : undefined;

  const getCachedEtag = cacheDir
    ? (filePath: string) =>
        new Promise<string | undefined>((resolve, reject) => {
          try {
            const hash = createHash('md5');
            const stream = createReadStream(path.join(cacheDir, filePath));

            stream.on('data', (chunk) => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', (err) => {
              const { code } = err as unknown as { code?: unknown };
              if (code === 'ENOENT') {
                resolve(undefined);
              } else {
                reject(err);
              }
            });
          } catch (err) {
            reject(err);
          }
        })
    : undefined;

  const getCachedFile = cacheDir ? (filePath: string) => fs.readFile(path.join(cacheDir, filePath), 'utf8') : undefined;

  const setCachedFile = cacheDir
    ? async (filePath: string, contents: string) => {
        await fs.mkdir(path.dirname(path.resolve(cacheDir, filePath)), { recursive: true });
        await fs.writeFile(path.resolve(cacheDir, filePath), contents, 'utf8');
      }
    : undefined;

  const getFileFromS3 = async (
    file: string,
    etag?: string | undefined,
  ): Promise<{ status: 200; body: string } | { status: 304 } | { status: 404 } | { status: 500 }> => {
    try {
      const res = await s3.send(
        new GetObjectCommand({
          Bucket: S3_BUCKET,
          Key: file,
          IfNoneMatch: etag,
        }),
      );

      return { status: 200, body: (await res.Body?.transformToString('utf8')) ?? '' };
    } catch (err) {
      const { $metadata } = err as unknown as { $metadata?: { httpStatusCode?: number } };
      if ($metadata?.httpStatusCode === 304) {
        return { status: 304 };
      } else if ($metadata?.httpStatusCode === 404) {
        return { status: 404 };
      } else {
        return { status: 500 };
      }
    }
  };

  const headFileFromS3 = async (
    file: string,
  ): Promise<{ status: 200 } | { status: 304 } | { status: 404 } | { status: 500 }> => {
    try {
      await s3.send(
        new HeadObjectCommand({
          Bucket: S3_BUCKET,
          Key: file,
        }),
      );

      return { status: 200 };
    } catch (err) {
      const { $metadata } = err as unknown as { $metadata?: { httpStatusCode?: number } };
      if ($metadata?.httpStatusCode === 304) {
        return { status: 304 };
      } else if ($metadata?.httpStatusCode === 404) {
        return { status: 404 };
      } else {
        return { status: 500 };
      }
    }
  };

  return {
    async exists(file) {
      try {
        const etag = await getCachedEtag?.(file);
        console.log('etag', file, etag);
        const contents = cacheDir ? await getFileFromS3(file, etag) : await headFileFromS3(file);
        console.log('contents', file, contents);

        if (contents.status === 304) {
          return true;
        } else if (contents.status === 200) {
          if (cacheDir && 'body' in contents) {
            await setCachedFile?.(file, contents.body as string);
          }
          return true;
        } else {
          return false;
        }
      } catch (err) {
        console.error('exists', err);
        throw err;
      }
    },
    async readFile(file) {
      try {
        // console.log('readFile', { bucket, file });

        const etag = await getCachedEtag?.(file);
        const contents = await getFileFromS3(file, etag);

        if (contents.status === 304) {
          return await getCachedFile!(file);
        } else if (contents.status === 200) {
          await setCachedFile?.(file, contents.body);
          return contents.body;
        } else {
          throw new Error('Failed to get template from S3');
        }
      } catch (err) {
        console.error('readFile', err);
        throw err;
      }
    },

    existsSync() {
      throw new Error('Cannot call existsSync');
    },
    readFileSync() {
      throw new Error('Cannot call readFileSync');
    },

    dirname(file) {
      // console.log('dirname', { file });
      return path.posix.dirname(file);
    },
    resolve(dir, file, ext) {
      // console.log('resolve', { dir, file, ext });
      return path.posix.join(dir, file + ext);
    },
    sep: path.posix.sep,
  };
}

export function createLocalFS({ root }: { root: string }): FS {
  return {
    async exists(file) {
      try {
        await fs.stat(path.join(root, file));
        return true;
      } catch (err) {
        if ((err as Record<string, unknown>).code === 'ENOENT') {
          return false;
        } else {
          throw err;
        }
      }
    },
    async readFile(file) {
      return (await fs.readFile(path.join(root, file))).toString('utf8');
    },

    existsSync() {
      throw new Error('Cannot call existsSync');
    },
    readFileSync() {
      throw new Error('Cannot call readFileSync');
    },

    dirname(file) {
      // console.log('dirname', { file });
      return path.dirname(file);
    },
    resolve(dir, file, ext) {
      // console.log('resolve', { dir, file, ext });
      return path.join(dir, file + ext);
    },
    sep: path.sep,
  };
}
