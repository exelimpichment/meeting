import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MEETING_API_NATS_CLIENT } from './constants';

@Injectable()
export class MeetingApiGatewayService {
  constructor(
    @Inject(MEETING_API_NATS_CLIENT) private meetingClient: ClientProxy,
  ) {}

  // Should only answer: “Is the process healthy enough to keep running?”
  // implement some lightweight check.
  liveness(): { status: string } {
    return { status: 'ok' };
  }

  // Tells Kubernetes if the pod can accept traffic.
  // If it fails → the pod is marked unready, but not restarted.
  // Should check dependencies (DB, cache, migrations, etc.) that are needed to serve requests.
  readiness(): { status: string } {
    return { status: 'ok' };
  }
}
