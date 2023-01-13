import Cache from '@blued-core/cache'
import { RedisConf } from '@blued-core/redis-conf'
import RedisClient from '@blued-core/redis-client'
import { IS_LOCAL, CLIENT_SYNC_INTERVAL, REDIS_QCONF_CONFIG_PATH_MAP } from '@/configs'

const redisConf = new RedisConf(REDIS_QCONF_CONFIG_PATH_MAP)

const redisClient = new RedisClient(redisConf, new Cache(), IS_LOCAL, CLIENT_SYNC_INTERVAL)

/**
 * 每次使用时调用函数现取， 不要全局缓存
 * https://github.com/bluedapp/node-util-client/tree/master/packages/redis-client
 * @param path
 */
export const getRedisClient = (path: string) => redisClient.getClient(path)
