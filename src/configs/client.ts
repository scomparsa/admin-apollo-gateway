import { RedisConfItem } from '@blued-core/redis-conf'

export const CLIENT_SYNC_INTERVAL = 30000

export const REDIS_QCONF_CONFIG_PATH: Record<string, string> = {
  ADMIN: 'admin',
}

export const REDIS_QCONF_CONFIG_PATH_MAP: Record<string, RedisConfItem> = {
  [REDIS_QCONF_CONFIG_PATH.ADMIN]: '',
}
