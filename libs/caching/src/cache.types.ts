export interface RedisCacheOptions {
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: number;
  ttlMs?: number;
  keyPrefix?: string;
}
