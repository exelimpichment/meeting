import { Injectable } from '@nestjs/common';
import { IAmPrismaService } from './iam/src/prisma';

@Injectable()
export class MeetingApiGatewayService {
  constructor(private readonly iamPrismaService: IAmPrismaService) {}

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

  dbFetch() {
    return this.iamPrismaService.users.findMany();
  }
}
