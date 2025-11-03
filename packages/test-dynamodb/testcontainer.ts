import assert from 'assert';

import { GenericContainer, type StartedTestContainer } from 'testcontainers';
import { URL } from 'url';

/**
 * A class for managing DynamoDB testcontainer setup for unit testing
 */
export class TestDynamoDBContainer {
  private container: StartedTestContainer | null = null;
  protected image: string = 'amazon/dynamodb-local:3.0.0';
  protected port: number = 8000;

  constructor(opts?: { image?: string | undefined; port?: number | undefined }) {
    if (opts?.image) {
      this.image = opts.image;
    }
    if (opts?.port) {
      this.port = opts.port;
    }
  }

  /**
   * Creates and starts a DynamoDB testcontainer and sets up the database
   */
  async start(endpoint: string): Promise<void> {
    const { port } = new URL(endpoint);
    const portNum = parseInt(port, 10);
    assert(!isNaN(portNum), 'Expected { endpoint } var to have a port number');

    this.container = await new GenericContainer(this.image)
      .withExposedPorts({ container: this.port, host: portNum, protocol: 'tcp' })
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
