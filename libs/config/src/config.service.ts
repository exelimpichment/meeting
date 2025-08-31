import { Injectable } from '@nestjs/common';
import {
  ConfigService as NestConfigService,
  Path,
  PathValue,
} from '@nestjs/config';

@Injectable()
export class ConfigService<Env = Record<string, unknown>> {
  // Inject NestJS's ConfigService
  constructor(private nestConfigService: NestConfigService<Env, true>) {}

  /**
   * Get a configuration value (typed)
   * @param key The configuration key (potentially nested path)
   * @returns The configuration value
   */
  get<P extends Path<Env>>(key: P): PathValue<Env, P> {
    // Use { infer: true } to get the typed value
    // The return type of nestConfigService.get should match PathValue<Env, P>
    return this.nestConfigService.get(key, { infer: true });
  }
}
