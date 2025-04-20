import jwt from 'jsonwebtoken';

import { AWS_LAMBDA_FUNCTION_NAME, USER_AUTH_SECRET } from '@/backend-api/src/config';

export interface UserToken {
  userId: string;
  sessionId: string;
}

export function createUserToken(create: UserToken): string {
  return jwt.sign({}, USER_AUTH_SECRET, {
    algorithm: 'HS256',
    issuer: AWS_LAMBDA_FUNCTION_NAME,
    audience: create.userId,
    subject: create.sessionId,
    expiresIn: '30d',
    notBefore: '1ms',
  });
}

export function verifyUserToken(token: string): UserToken | undefined {
  const payload = jwt.verify(token, USER_AUTH_SECRET, {
    algorithms: ['HS256'],
    complete: false,
  }) as Record<string, unknown>;

  if (typeof payload.aud === 'string' && typeof payload.sub === 'string') {
    return {
      userId: payload.aud,
      sessionId: payload.sub,
    };
  } else {
    return undefined;
  }
}
