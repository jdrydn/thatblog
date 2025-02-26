import createLogger, { stdSerializers } from 'pino';

export const logger = createLogger({
  messageKey: 'message',
  nestedKey: 'data',
  errorKey: 'err', // data.err

  base: {
    ...(process.env.AWS_LAMBDA_FUNCTION_NAME && { functionName: process.env.AWS_LAMBDA_FUNCTION_NAME }),
    ...(process.env.AWS_LAMBDA_LOG_GROUP_NAME && { logGroupName: process.env.AWS_LAMBDA_LOG_GROUP_NAME }),
    ...(process.env.AWS_LAMBDA_LOG_STREAM_NAME && { logStreamName: process.env.AWS_LAMBDA_LOG_STREAM_NAME }),
  },

  mixin: process.env._X_AMZN_TRACE_ID ? () => ({ traceId: process.env._X_AMZN_TRACE_ID }) : undefined,

  serializers: {
    err: stdSerializers.err,
  },
});
