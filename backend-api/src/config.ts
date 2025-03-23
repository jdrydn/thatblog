import assert from 'http-assert-plus';

assert(process.env.THATBLOG_DYNAMODB_TABLENAME, 'Missing { THATBLOG_DYNAMODB_TABLENAME } from env');
export const DYNAMODB_TABLENAME = process.env.THATBLOG_DYNAMODB_TABLENAME;
