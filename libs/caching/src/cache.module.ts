import { DynamicModule, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import type { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { CacheService } from './index';
import { RedisCacheOptions } from './cache.types';

@Module({})
export class SharedCacheModule {
  static register(options: RedisCacheOptions): DynamicModule {
    return {
      module: SharedCacheModule,
      imports: [
        CacheModule.registerAsync({
          isGlobal: false,
          useFactory: async () => ({
            store: await redisStore(resolveRedisOptions(options)),
            ttl: options.ttlMs,
          }),
        }),
      ],
      providers: [CacheService],
      exports: [CacheService],
    };
  }

  static registerAsync(
    options: CacheModuleAsyncOptions<RedisCacheOptions>,
  ): DynamicModule {
    return {
      module: SharedCacheModule,
      imports: [
        CacheModule.registerAsync({
          isGlobal: false,
          inject: options.inject,
          useFactory: async (...args: unknown[]) => {
            if (!options.useFactory) {
              throw new Error(
                'sharedCacheModule.registerAsync requires useFactory',
              );
            }
            const factory = options.useFactory as (
              ...factoryArgs: unknown[]
            ) => Promise<RedisCacheOptions> | RedisCacheOptions;

            const cfg = await factory(...args);

            return {
              store: await redisStore(resolveRedisOptions(cfg)),
              ttl: cfg.ttlMs,
            };
          },
        }),
      ],
      providers: [CacheService],
      exports: [CacheService],
    };
  }
}

function resolveRedisOptions(options: RedisCacheOptions) {
  if (options.url) {
    return {
      url: options.url,
      database: options.database,
      username: options.username,
      password: options.password,
      keyPrefix: options.keyPrefix,
    };
  }
  return {
    database: options.database,
    username: options.username,
    password: options.password,
    keyPrefix: options.keyPrefix,
    socket: {
      host: options.host ?? '127.0.0.1',
      port: options.port ?? 6379,
    },
  };
}
