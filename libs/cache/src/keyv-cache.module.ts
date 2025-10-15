import { DynamicModule, Module, type ModuleMetadata } from '@nestjs/common';
import { KeyvCacheService } from '@/libs/cache/src/keyv-cache.service';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

type FactoryResult = { url: string; namespace?: string; ttlMs?: number };

type ForRootAsyncOptions = Pick<ModuleMetadata, 'imports'> & {
  inject?: unknown[];
  useFactory: (...args: unknown[]) => Promise<FactoryResult> | FactoryResult;
  isGlobal?: boolean;
};

@Module({})
export class KeyvCacheModule {
  static forRootAsync(options: ForRootAsyncOptions): DynamicModule {
    return {
      module: KeyvCacheModule,

      imports: [
        CacheModule.registerAsync({
          isGlobal: options.isGlobal,
          imports: options.imports,
          inject: options.inject,
          useFactory: async (...args: unknown[]) => {
            const cfg = await options.useFactory(...args);

            return {
              stores: [new KeyvRedis(cfg.url)],
              ttl: cfg.ttlMs,
              namespace: cfg.namespace,
            };
          },
        }),
      ],

      providers: [KeyvCacheService],
      exports: [KeyvCacheService, CacheModule],
      global: options.isGlobal === true,
    };
  }
}

// The implementation doesn’t include hooks for testing (e.g., mocking the cache store). Adding a way to inject a mock store or a test configuration could make unit testing easier.
