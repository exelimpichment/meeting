import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { NatsService } from '@/apps/messenger-ws-gateway/src/nats/nats.service';
import { Subscription } from 'nats';
import { WebSocket } from 'ws';
import { AuthenticatedWebSocket } from '@/libs/shared-authentication/src/types';

@Injectable()
export class ConversationSubscriptionsService implements OnModuleDestroy {
  private readonly logger = new Logger(ConversationSubscriptionsService.name);

  private readonly socketsByConversation = new Map<
    string,
    Set<AuthenticatedWebSocket>
  >();
  private readonly subByConversation = new Map<string, Subscription>();
  private readonly conversationBySocket = new WeakMap<
    AuthenticatedWebSocket,
    string
  >();
  private readonly lastPongBySocket = new WeakMap<
    AuthenticatedWebSocket,
    number
  >();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private readonly pingIntervalMs = 30_000;
  private readonly pongTimeoutMs = 90_000;

  constructor(private readonly nats: NatsService) {}

  onModuleDestroy(): void {
    for (const [, sub] of this.subByConversation) {
      this.nats.unsubscribe(sub);
    }
    this.subByConversation.clear();
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  addSocket(conversationId: string, client: AuthenticatedWebSocket): void {
    this.conversationBySocket.set(client, conversationId);

    let sockets = this.socketsByConversation.get(conversationId);

    if (!sockets) {
      sockets = new Set<AuthenticatedWebSocket>();
      this.socketsByConversation.set(conversationId, sockets);
    }

    sockets.add(client);

    // heartbeat tracking
    this.lastPongBySocket.set(client, Date.now());

    (client as unknown as WebSocket).on('pong', () =>
      this.lastPongBySocket.set(client, Date.now()),
    );
    this.ensureHeartbeat();

    // subscribe if first socket for conversation
    if (!this.subByConversation.has(conversationId)) {
      const subject = `messenger.conversation.${conversationId}`;

      const sub = this.nats.subscribe(subject, (payload) => {
        const set = this.socketsByConversation.get(conversationId);

        if (!set) return;

        const message = JSON.stringify({ type: 'message.event', payload });

        for (const socket of set) {
          if (socket.readyState !== WebSocket.OPEN) {
            continue;
          }
          if (socket.bufferedAmount > 1_000_000) {
            continue;
          }

          socket.send(message);
        }
      });

      this.subByConversation.set(conversationId, sub);

      this.logger.log(`subscribed to ${subject}`);
    }
  }

  removeSocket(client: AuthenticatedWebSocket): void {
    const conversationId = this.conversationBySocket.get(client);
    if (!conversationId) return;

    const sockets = this.socketsByConversation.get(conversationId);
    if (sockets) {
      sockets.delete(client);
      if (sockets.size === 0) {
        this.socketsByConversation.delete(conversationId);
        const sub = this.subByConversation.get(conversationId);
        if (sub) {
          this.nats.unsubscribe(sub);
          this.subByConversation.delete(conversationId);
          this.logger.log(
            `unsubscribed from messenger.conversation.${conversationId}`,
          );
        }
      }
    }
  }

  private ensureHeartbeat(): void {
    if (this.heartbeatTimer) return;
    this.heartbeatTimer = setInterval(
      () => this.runHeartbeat(),
      this.pingIntervalMs,
    );
  }

  private runHeartbeat(): void {
    const now = Date.now();

    for (const [, sockets] of this.socketsByConversation) {
      for (const ws of sockets) {
        if ((ws as unknown as WebSocket).readyState !== WebSocket.OPEN)
          continue;

        const last = this.lastPongBySocket.get(ws) || 0;

        if (now - last > this.pongTimeoutMs) {
          try {
            (ws as unknown as WebSocket).close();
          } catch {
            // ignore
          }
          continue;
        }
        try {
          (ws as unknown as WebSocket).ping();
        } catch {
          // ignore
        }
      }
    }
  }
}
