import assert from 'http-assert-plus';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export function getHeader(headers?: APIGatewayProxyEventV2['headers'], key?: string): string | undefined {
  return headers?.[key || ''] || headers?.[key?.toLowerCase() || ''] || undefined;
}

export function parseAuthHeader(value: string): string {
  const [authType, authToken] = value.split(' ');
  assert(authType === 'Bearer', 403, 'Expected auth token to be a Bearer token');
  assert(authToken.split('.').length === 3, 403, 'Expected auth token to be a JWT string');
  return authToken;
}
