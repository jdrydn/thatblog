import assert from 'assert';

import { GenericContainer, type StartedTestContainer } from 'testcontainers';
import { URL } from 'url';

/**
 * A class for managing DynamoDB testcontainer setup for unit testing
 */
export class TestDynamoDBContainer {
  private container: StartedTestContainer | null = null;

  /**
   * Creates and starts a DynamoDB testcontainer and sets up the database
   */
  async start(): Promise<void> {
    assert(process.env.THATBLOG_DYNAMODB_ENDPOINT, 'Missing { THATBLOG_DYNAMODB_ENDPOINT } env');

    const { port } = new URL(process.env.THATBLOG_DYNAMODB_ENDPOINT);
    const portNum = parseInt(port, 10);
    assert(!isNaN(portNum), 'Expected { THATBLOG_DYNAMODB_ENDPOINT } env to have a port number');

    this.container = await new GenericContainer('amazon/dynamodb-local:3.0.0')
      .withExposedPorts({ container: 8000, host: portNum, protocol: 'tcp' })
      .start();

    assert(this.container, 'Container not started - call start() first');
  }

  /**
   * Stops the DynamoDB container and cleans up
   */
  async stop(): Promise<void> {
    if (this.container) {
      await this.container.stop();
      this.container = null;
    }
  }
}
