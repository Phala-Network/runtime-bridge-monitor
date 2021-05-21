import { MessageTarget } from '../message/proto'
import { REDIS_ENDPOINT } from '../utils/constants'
import { createDispatcher, createMessageTunnel } from '../message'
import logger from '../utils/logger'

let server

const setServer = async () => {
  const injectMessage = (message) =>
    Object.assign(message, {
      context: {
        dispatcher,
      },
    })

  const tunnelConnection = await createMessageTunnel({
    redisEndpoint: REDIS_ENDPOINT,
    from: MessageTarget.values.MTG_MANAGER,
  })

  const { subscribe, query } = tunnelConnection
  const dispatcher = createDispatcher({
    tunnelConnection,
    queryHandlers: {},
    plainHandlers: {},
    dispatch: (message) => {
      try {
        if (
          message.to === 'MTG_BROADCAST' ||
          message.to === 'MTG_MANAGER' ||
          message.to === 'MTG_WORKER'
        ) {
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

export const getServer = async () => {
  if (server) {
    return server
  }
  server = await setServer()
  return server
}
export default getServer
