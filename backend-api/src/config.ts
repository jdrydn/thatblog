import assert from 'http-assert-plus';

assert(process.env.AWS_LAMBDA_FUNCTION_NAME, 'Missing { AWS_LAMBDA_FUNCTION_NAME } from env');
export const AWS_LAMBDA_FUNCTION_NAME = process.env.AWS_LAMBDA_FUNCTION_NAME;

assert(process.env.THATBLOG_DYNAMODB_TABLENAME, 'Missing { THATBLOG_DYNAMODB_TABLENAME } from env');
export const DYNAMODB_TABLENAME = process.env.THATBLOG_DYNAMODB_TABLENAME;

assert(process.env.THATBLOG_S3_BUCKET, 'Missing { THATBLOG_S3_BUCKET } from env');
export const S3_BUCKET = process.env.THATBLOG_S3_BUCKET;

assert(process.env.THATBLOG_USER_AUTH_SECRET, 'Missing { THATBLOG_USER_AUTH_SECRET } from env');
export const USER_AUTH_SECRET = process.env.THATBLOG_USER_AUTH_SECRET;
