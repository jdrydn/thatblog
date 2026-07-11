import { execSync } from 'node:child_process';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GenericContainer, Wait, type StartedTestContainer } from 'testcontainers';
import type { GlobalSetupContext } from 'vitest/node';
import { createTable } from './table';

// Spin up one local DynamoDB for the whole run (PLAN.md 11, 13). The endpoint + table name are
// provided to test workers via inject() — specs build their own client through test/dynamo.ts, so
// nothing depends on import-time env.
let container: StartedTestContainer;

// Point testcontainers at whatever local Docker runtime the dev uses. testcontainers only
// auto-discovers via DOCKER_HOST, so when it's unset we read the active `docker context` endpoint
// (colima / orbstack / default all work). Ryuk (the reaper container) is off by default — our
// teardown stops the container explicitly, and Ryuk's socket bind-mount is awkward under colima.
function ensureDockerRuntime() {
  process.env.TESTCONTAINERS_RYUK_DISABLED ??= 'true';
  if (process.env.DOCKER_HOST) return;
  try {
    const host = execSync('docker context inspect --format "{{.Endpoints.docker.Host}}"', {
      encoding: 'utf8',
    }).trim();
    if (host) process.env.DOCKER_HOST = host;
  } catch {
    // Leave it to testcontainers' own discovery; it'll raise a clear error if Docker is unreachable.
  }
}

export default async function setup({ provide }: GlobalSetupContext) {
  ensureDockerRuntime();

  container = await new GenericContainer('amazon/dynamodb-local:latest')
    .withExposedPorts(8000)
    .withWaitStrategy(Wait.forListeningPorts())
    .start();

  const endpoint = `http://${container.getHost()}:${container.getMappedPort(8000)}`;
  const tableName = 'thatblog-test';

  const client = new DynamoDBClient({
    endpoint,
    region: 'local',
    credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
  });
  await createTable(client, tableName);
  client.destroy();

  provide('dynamoEndpoint', endpoint);
  provide('tableName', tableName);

  return async () => {
    await container.stop();
  };
}

declare module 'vitest' {
  export interface ProvidedContext {
    dynamoEndpoint: string;
    tableName: string;
  }
}
