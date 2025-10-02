import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthenticatedWebSocket } from '@/libs/shared-authentication/src/types';

@Catch(WsException)
export class WebSocketExceptionFilter implements ExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<AuthenticatedWebSocket>();
    const data: unknown = host.switchToWs().getData();

    if (client.readyState === client.OPEN) {
      client.send(
        JSON.stringify({
          type: 'error',
          error: exception.message,
          data: data,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }
}
