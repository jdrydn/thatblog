import createLogger, { stdSerializers } from 'pino';

export const logger = createLogger({
  messageKey: 'message',
  nestedKey: 'data',
  errorKey: 'err', // data.err

  base: {
    // Bundle Lambda env vars into each log
    ...(process.env.AWS_LAMBDA_FUNCTION_NAME && { functionName: process.env.AWS_LAMBDA_FUNCTION_NAME }),
    ...(process.env.AWS_LAMBDA_LOG_GROUP_NAME && { logGroupName: process.env.AWS_LAMBDA_LOG_GROUP_NAME }),
    ...(process.env.AWS_LAMBDA_LOG_STREAM_NAME && { logStreamName: process.env.AWS_LAMBDA_LOG_STREAM_NAME }),
  },

  // _X_AMZN_TRACE_ID is set on each Lambda invocation, so bundle it into each log on each log call
  mixin: process.env._X_AMZN_TRACE_ID ? () => ({ traceId: process.env._X_AMZN_TRACE_ID }) : undefined,

  serializers: {
    err: stdSerializers.err,
  },
});
