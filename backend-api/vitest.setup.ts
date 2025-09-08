import ms from 'ms';

import { DYNAMODB_ENDPOINT, DYNAMODB_TABLENAME } from '@/backend-api/src/config';
import { dydb } from '@/backend-api/src/services';
import { createTable, deleteTable } from '@thatblog/test-dynamodb/tables';
import { TestDynamoDBContainer } from '@thatblog/test-dynamodb/testcontainer';

const startedAt = Date.now();
let container: TestDynamoDBContainer | null = null;

export async function setup() {
  if (process.env.SKIP_TESTCONTAINERS_DYNAMODB !== 'yes') {
    console.log(
      '[DynamoDB][Local] Starting DynamoDB container (amazon/dynamodb-local) (%s) (%s)',
      DYNAMODB_ENDPOINT,
      ms(Date.now() - startedAt),
    );
    container = new TestDynamoDBContainer();
    await container.start();
    console.log('[DynamoDB][Local] Ready! (%s)', ms(Date.now() - startedAt));
  }

  try {
    await deleteTable(dydb, DYNAMODB_TABLENAME);
    console.log(
      '[DynamoDB] Deleted table: %s (%s) (%s)',
      DYNAMODB_TABLENAME,
      DYNAMODB_ENDPOINT ?? 'AWS',
      ms(Date.now() - startedAt),
    );
  } catch (err) {
    const { name } = err as { name?: string };
    if (name !== 'ResourceNotFoundException') {
      throw err;
    }
  }

  await createTable(dydb, DYNAMODB_TABLENAME);

  console.log(
    '[DynamoDB] Created table: %s (%s) (%s)',
    DYNAMODB_TABLENAME,
    DYNAMODB_ENDPOINT ?? 'AWS',
    ms(Date.now() - startedAt),
  );

  process.stdout.write('\n');
}

export async function teardown() {
  if (container) {
    process.stdout.write('\n');
    console.log('[DynamoDB][Local] Stopping DynamoDB container (%s)', ms(Date.now() - startedAt));
    await container.stop();
    console.log('[DynamoDB][Local] Stopped! (%s)', ms(Date.now() - startedAt));
  }
}
