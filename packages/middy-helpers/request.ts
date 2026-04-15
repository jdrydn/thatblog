import type { RequestHeaders } from './types';

export function getHeader(headers: RequestHeaders, key: string): string | undefined {
  return headers[key] || headers[key.toLowerCase()] || undefined;
}
