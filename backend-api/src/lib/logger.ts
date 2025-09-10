import createLogger, { stdSerializers } from 'pino';

export const logger = createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  messageKey: 'message',
  errorKey: 'err', // data.err

  base: {
    // Bundle Lambda env vars into each log
    ...(process.env.AWS_LAMBDA_FUNCTION_NAME && { functionName: process.env.AWS_LAMBDA_FUNCTION_NAME }),
    ...(process.env.AWS_LAMBDA_FUNCTION_VERSION && { functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION }),
    ...(process.env.AWS_LAMBDA_LOG_GROUP_NAME && { logGroupName: process.env.AWS_LAMBDA_LOG_GROUP_NAME }),
    ...(process.env.AWS_LAMBDA_LOG_STREAM_NAME && { logStreamName: process.env.AWS_LAMBDA_LOG_STREAM_NAME }),
  },

  serializers: {
    err: stdSerializers.err,
  },
});
