import { createTable } from '@thatblog/test-dynamodb/tables';

import { DYNAMODB_TABLENAME } from '@/src/config';
import { dydb } from '@/src/services';

export function setupDynamoDB() {
  return createTable(dydb, DYNAMODB_TABLENAME);
}
