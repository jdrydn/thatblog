import type { LambdaEvent, LambdaResult, LambdaContext } from '@/src/types';

export function handler(_event: LambdaEvent, _context: LambdaContext): Promise<LambdaResult> {
  return Promise.resolve({
    statusCode: 200,
    headers: { 'content-type': 'text/plain' },
    body: 'Hello, world',
  });
}
