import assert from 'http-assert-plus';
import { posix } from 'path';
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import type { FS } from 'liquidjs';

const s3 = new S3Client();

export const fs: FS = {
  async exists(file) {
    const { S3_BUCKET } = process.env;
    // console.log('exists', { S3_BUCKET, file });
    try {
      assert(S3_BUCKET, 'Missing { S3_BUCKET } env');

      await s3.send(
        new HeadObjectCommand({
          Bucket: S3_BUCKET,
          Key: file,
        }),
      );

      return true;
    } catch (err) {
      throw err;
    }
  },
  existsSync() {
    throw new Error('Cannot call existsSync');
  },

  async readFile(file) {
    const { S3_BUCKET } = process.env;
    // console.log('readFile', { S3_BUCKET, file });
    try {
      assert(S3_BUCKET, 'Missing { S3_BUCKET } env');

      const res = await s3.send(
        new GetObjectCommand({
          Bucket: S3_BUCKET,
          Key: file,
        }),
      );

      return res.Body?.transformToString('utf8') ?? '';
    } catch (err) {
      throw err;
    }
  },
  readFileSync() {
    throw new Error('Cannot call readFileSync');
  },

  dirname(file) {
    // console.log('dirname', { file });
    return posix.dirname(file);
  },
  resolve(dir, file, ext) {
    // console.log('resolve', { dir, file, ext });
    return posix.join(dir, file + ext);
  },
  sep: '/',
};
