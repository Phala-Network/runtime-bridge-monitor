import { prb } from '../../vendor/proto-types/proto'
import { REDIS_ENDPOINT } from '../config'
import { MessageTunnel } from './client'

const createTunnel = async (identity: prb.MessageTarget): Promise<MessageTunnel> => {
  const tunnel = new MessageTunnel(REDIS_ENDPOINT, identity)
  await tunnel.awaitRedisReady()

  tunnel.listen({ dispatch: () => {} })

  return tunnel
}

export const manager = createTunnel(prb.MessageTarget.MTG_MANAGER)
