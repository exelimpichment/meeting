import { Injectable } from '@nestjs/common';
import {
  ConfigService as NestConfigService,
  Path,
  PathValue,
} from '@nestjs/config';

@Injectable()
export class ConfigService<K = Record<string, unknown>> {
  // Inject NestJS's ConfigService
  constructor(private nestConfigService: NestConfigService<K, true>) {}

  /**
   * Get a configuration value (typed)
   * @param key The configuration key (potentially nested path)
   * @returns The configuration value
   */
  get<P extends Path<K>>(key: P): PathValue<K, P> {
    // Use { infer: true } to get the typed value
    // The return type of nestConfigService.get should match PathValue<K, P>
    return this.nestConfigService.get(key, { infer: true });
  }
}
