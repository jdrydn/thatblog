import crypto from 'crypto';

process.env.THATBLOG_TEST_UNIQUE_ID = crypto.randomBytes(4).toString('hex');

process.env.THATBLOG_DYNAMODB_TABLENAME = ((a) => a.filter((b) => typeof b === 'string').join('-'))([
  process.env.THATBLOG_DYNAMODB_TABLENAME,
  process.env.THATBLOG_TEST_UNIQUE_ID,
  process.env.VITEST_POOL_ID,
]);
