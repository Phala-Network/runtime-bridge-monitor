import { list as redisCommands } from 'redis-commands'
import Redis from 'ioredis'
import logger from '../utils/logger'

const createClient = async (redisEndpoint) => {
  const { default: Queue } = await __server_import('p-queue')
  return new Promise((resolve) => {
    const queue = new Queue({
      timeout: 3000,
      throwOnTimeout: true,
    })

    const client = new Redis(redisEndpoint)

    redisCommands.forEach((i) => {
      const command = i.split(' ')[0]

      if (command !== 'multi') {
        const func = client[i]
        const _func = (...args) => queue.add(() => func.apply(client, args))

        client[i.toUpperCase()] = client[i]
        client[i] = function (...args) {
          if (typeof args[args.length - 1] === 'function') {
            return func.apply(client, args)
          } else {
            return _func(...args).catch((e) => {
              if (e && e.name === 'TimeoutError') {
                return _func(...args)
              }
              throw e
            })
          }
        }
      }
    })

    client.on('ready', () => {
      resolve(client)
    })

    client.on('error', (e) => {
      logger.error('REDIS ERROR!', e)
    })
  })
}

export default createClient
