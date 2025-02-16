import fs from 'fs/promises';
import path from 'path';
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import type { FS } from 'liquidjs';

export function createS3FS({ bucket }: { bucket: string }): FS {
  const s3 = new S3Client();

  return {
    async exists(file) {
      try {
        // console.log('exists', { bucket, file });

        await s3.send(
          new HeadObjectCommand({
            Bucket: bucket,
            Key: file,
          }),
        );

        return true;
      } catch (err) {
        throw err;
      }
    },
    async readFile(file) {
      try {
        // console.log('readFile', { bucket, file });

        const res = await s3.send(
          new GetObjectCommand({
            Bucket: bucket,
            Key: file,
          }),
        );

        return res.Body?.transformToString('utf8') ?? '';
      } catch (err) {
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
