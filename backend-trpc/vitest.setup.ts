import assert from 'assert';
import ms from 'ms';

import { TestDynamoDBContainer } from '@thatblog/test-dynamodb/testcontainer';

const startedAt = Date.now();
let container: TestDynamoDBContainer | null = null;

/**
 * This runs once per test invocation
 * So in dev, with hot reloading, this'll only run once!
 */
export async function setup() {
  if (process.env.SKIP_TESTCONTAINERS_DYNAMODB !== 'yes') {
    assert(process.env.THATBLOG_DYNAMODB_ENDPOINT, 'Expected { THATBLOG_DYNAMODB_ENDPOINT } env to be set');
    console.log(
      '[DynamoDB][Local] Starting DynamoDB container (amazon/dynamodb-local) (%s) (%s)',
      process.env.THATBLOG_DYNAMODB_ENDPOINT,
      ms(Date.now() - startedAt),
    );

    container = new TestDynamoDBContainer();
    await container.start(process.env.THATBLOG_DYNAMODB_ENDPOINT);
    console.log('[DynamoDB][Local] Ready! (%s)', ms(Date.now() - startedAt));
  }
}

export async function teardown() {
  if (container) {
    process.stdout.write('\n');
    console.log('[DynamoDB][Local] Stopping DynamoDB container (%s)', ms(Date.now() - startedAt));
    await container.stop();
    console.log('[DynamoDB][Local] Stopped! (%s)', ms(Date.now() - startedAt));
  }
}
