import { ExtendedWebSocket } from '@/libs/shared-authentication/src/types';
import { INestApplicationContext } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { IncomingMessage } from 'http';
import { Server } from 'ws';

/**
 * custom WebSocket adapter that attaches the HTTP upgrade request to the client.
 * this allows guards to access cookies and headers from the initial HTTP upgrade request.
 */
export class CustomWsAdapter extends WsAdapter {
  constructor(appOrHttpServer?: INestApplicationContext) {
    super(appOrHttpServer);
  }

  // override the create method to attach the upgrade request to the client
  public create(
    port: number,
    options?: Record<string, unknown> & {
      namespace?: string;
      server?: unknown;
      path?: string;
    },
  ): Server {
    const server = super.create(port, options) as Server;

    // intercept the 'connection' event to attach the upgrade request
    server.on(
      'connection',
      (client: ExtendedWebSocket, request: IncomingMessage) => {
        // attach the upgrade request to the client so guards can access it
        client.upgradeReq = request;
      },
    );

    return server;
  }
}
