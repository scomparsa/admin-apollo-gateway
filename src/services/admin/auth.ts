import { REDIS_QCONF_CONFIG_PATH } from '@/configs/client'
import { getRedisClient } from '@/utils/redis'

enum EIsActive {
  No,
  Yes,
}

export interface IAuth {
  getAuthPayload(id: number): Promise<null | { ip: string; isActive: number }>
  setAuthPayload(id: number, { ip, isActive }: { ip: string; isActive: EIsActive }): Promise<void>
}

export const auth: IAuth = {
  async getAuthPayload(id: number): Promise<null | { ip: string; isActive: number }> {
    const [ip, isActive] = await getRedisClient(REDIS_QCONF_CONFIG_PATH.ADMIN).HMGET(`u:${id}`, 'ip', 'isActive')

    return ip === null && isActive === null
      ? null
      : {
          ip,
          isActive: Number(isActive),
        }
  },

  async setAuthPayload(id: number, { ip, isActive }: { ip: string; isActive: EIsActive }): Promise<void> {
    await getRedisClient(REDIS_QCONF_CONFIG_PATH.ADMIN).HMSET(`u:${id}`, 'ip', ip, 'isActive', isActive)
  },
}
