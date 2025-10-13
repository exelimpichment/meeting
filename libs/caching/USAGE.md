# shared caching module usage

references: [nest caching - alternative stores](https://docs.nestjs.com/techniques/caching#using-alternative-cache-stores), [node-redis](https://github.com/redis/node-redis)

## install

```bash
pnpm add @nestjs/cache-manager cache-manager cache-manager-redis-yet redis
```

## module registration (meeting-api-gateway)

```ts
// apps/meeting-api-gateway/src/meeting-api-gateway.module.ts
import { Module } from '@nestjs/common';
import { SharedCacheModule } from '@app/caching';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SharedCacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        url: cfg.get<string>('REDIS_URL'),
        ttlMs: cfg.get<number>('CACHE_TTL_MS') ?? 60_000,
        keyPrefix: 'meeting:gw:',
      }),
    }),
  ],
})
export class MeetingApiGatewayModule {}
```

## service usage example

```ts
import { Injectable } from '@nestjs/common';
import { CacheService } from '@app/caching';

@Injectable()
export class ProfilesService {
  constructor(private readonly cache: CacheService) {}

  async getProfile(id: string) {
    return this.cache.getOrSet(
      `profile:${id}`,
      async () => {
        // fetch expensive data here
        return { id };
      },
      120_000,
    );
  }

  async invalidateProfile(id: string) {
    await this.cache.del(`profile:${id}`);
  }
}
```

## env examples

```bash
# local dev
# start redis locally
# docker run -p 6379:6379 -d redis:7
REDIS_URL=redis://localhost:6379/0
CACHE_TTL_MS=60000
```

```

## notes

- no interceptors or decorators are used; inject and use `CacheService` where needed.

```
