import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import type { APIGatewayProxyEventV2, Context, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

import { render } from './dist/server/entry-server.js';

const templateHtml = new Promise<string>(async (resolve) => {
  const { S3_BUCKET } = process.env;

  const s3 = new S3Client();
  const res = await s3.send(
    new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: 'frontend-blog/index.html',
    }),
  );

  resolve(res.Body!.transformToString('utf8'));
});

export async function handler(
  req: APIGatewayProxyEventV2,
  context: Context,
): Promise<APIGatewayProxyStructuredResultV2> {
  try {
    const rendered = await render(req.rawPath);

    const html = (await templateHtml)
      .replace(`<!--app-head-->`, rendered.head ?? '')
      .replace(`<!--app-html-->`, rendered.html ?? '');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: html,
      isBase64Encoded: false,
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
      body: err.stack,
      isBase64Encoded: false,
    };
  }
}
