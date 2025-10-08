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
    // no-op: keep adapter minimal and avoid DI lookups here
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

        // early guard: if incoming frame is not valid json, notify client
        client.on('message', (raw) => {
          const isText = typeof raw === 'string';

          const isBuffer = typeof raw !== 'string' && Buffer.isBuffer(raw);

          if (!isText && !isBuffer) return;

          const text = isText ? (raw as string) : raw.toString();
          try {
            JSON.parse(text);
          } catch {
            if (client.readyState === client.OPEN) {
              client.send(
                JSON.stringify({
                  type: 'error',
                  error: 'invalid json',
                  timestamp: new Date().toISOString(),
                }),
              );
              client.close(1003, 'invalid json');
            }
          }
        });
      },
    );

    return server;
  }
}
