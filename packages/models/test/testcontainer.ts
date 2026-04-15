import assert from 'assert';
import { GenericContainer, type StartedTestContainer } from 'testcontainers';
import { URL } from 'url';

export async function startDynamodbTestcontainer(endpoint: string): Promise<StartedTestContainer> {
  const portNum = parseInt(new URL(endpoint).port, 10);
  assert(!isNaN(portNum), 'Expected endpoint URL to include a valid port number');

  const container = new GenericContainer('amazon/dynamodb-local:3.0.0')
    // Configure exposed ports
    .withExposedPorts({
      container: 8000,
      host: portNum,
      protocol: 'tcp',
    });

  return container.start();
}

export async function stopDynamodbTestcontainer(container: StartedTestContainer | undefined): Promise<void> {
  if (container) {
    await container.stop();
  }
}

export default {
  startContainer: startDynamodbTestcontainer,
  stopContainer: stopDynamodbTestcontainer,
};
