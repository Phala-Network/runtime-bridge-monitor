import { MessageTarget } from '../message/proto'
import { REDIS_ENDPOINT } from '../utils/constants'
import { createDispatcher, createMessageTunnel } from '../message'
import logger from '../utils/logger'

const setServer = async (ns) => {
  const injectMessage = (message) =>
    Object.assign(message, {
      context: {
        dispatcher,
      },
    })

  logger.info(`REDIS_ENDPOINT = ${REDIS_ENDPOINT}`)
  const tunnelConnection = await createMessageTunnel({
    redisEndpoint: REDIS_ENDPOINT,
    from: MessageTarget.MTG_APP,
    ns,
  })

  const { subscribe, query } = tunnelConnection
  const dispatcher = createDispatcher({
    tunnelConnection,
    queryHandlers: {},
    plainHandlers: {},
    dispatch: (message) => {
      try {
        if (message.to === 'MTG_BROADCAST' || message.to === 'MTG_APP') {
          switch (message.type) {
            case 'MTP_QUERY':
              dispatcher.queryCallback(injectMessage(message))
              break
            case 'MTP_REPLY':
              dispatcher.replyCallback(injectMessage(message))
              break
            default:
              dispatcher.plainCallback(injectMessage(message))
              break
          }
        }
      } catch (error) {
        logger.error(error)
      }
    },
  })

  await subscribe(dispatcher)
  logger.info(
    'Now listening to the redis channel, old messages may be ignored.'
  )

  return { query, tunnelConnection, dispatcher }
}

const servers = {}

export const getServer = async (ns) => {
  if (servers[ns]) {
    return servers[ns]
  }
  servers[ns] = await setServer(ns)
  return servers[ns]
}
export default getServer
