import Redis from 'ioredis'
import { v4 as uuidv4 } from 'uuid'
import { prb } from '../../vendor/proto-types/proto'
import { APP_MESSAGE_TUNNEL_QUERY_TIMEOUT } from '../constants'
import { logger } from '../logger'

const DEFAULT_CHANNEL = 'prb'
const DEFAULT_TIMEOUT = APP_MESSAGE_TUNNEL_QUERY_TIMEOUT

const createRedisClient = async (redisEndpoint: string): Promise<Redis.Redis> => {
  return await new Promise((resolve) => {
    const client = new Redis(redisEndpoint)

    client.on('ready', () => {
      resolve(client)
    })

    client.on('error', (e) => {
      logger.error('REDIS ERROR!', e)
    })
  })
}

export default createRedisClient

export class MessageTunnel {
  private readonly identity: prb.MessageTarget
  private readonly pub: Redis.Redis
  private readonly sub: Redis.Redis
  private readonly ready: Promise<void>
  private readonly subscribers: Map<string, (message: prb.IMessage) => void>

  constructor (endpoint: string, identity: prb.MessageTarget) {
    this.identity = identity
    this.subscribers = new Map()

    this.pub = new Redis(endpoint)
    this.sub = new Redis(endpoint)

    const pubReady = new Promise(resolve => this.pub.on('ready', resolve))
    const subReady = new Promise(resolve => this.sub.on('ready', resolve))
    this.ready = Promise.all([pubReady, subReady]).then(() => { })
  }

  public readonly awaitRedisReady = async (): Promise<void> => await this.ready

  public readonly publish = async (message: prb.IMessage): Promise<string> => {
    const createdAt = Date.now()
    const nonce = uuidv4()

    const data = Object.assign({}, {
      createdAt,
      from: this.identity,
      nonce,
      to: prb.MessageTarget.MTG_BROADCAST,
      type: prb.MessageType.MTP_BROADCAST
    }, message)
    const payload = prb.Message.encode(data).finish()

    await this.pub.publishBuffer(DEFAULT_CHANNEL, Buffer.from(payload))
    return nonce
  }

  public readonly broadcast = async (request: prb.IMessage): Promise<string> => {
    return await this.publish(Object.assign({}, {
      // defaults of broadcasts
      to: prb.MessageTarget.MTG_BROADCAST,
      type: prb.MessageType.MTP_BROADCAST
    }, request))
  }

  public readonly query = async (request: prb.IMessage): Promise<prb.IMessage> => {
    const nonce = uuidv4()
    const reply = this.recv(nonce)

    await this.publish(Object.assign({}, {
      nonce,
      type: prb.MessageType.MTP_QUERY
    }, request))

    return await reply
  }

  private readonly recv = async (nonce: string): Promise<prb.IMessage> => {
    return await new Promise((resolve, reject) => {
      if (this.subscribers.has(nonce)) {
        throw new Error('Mulitple subscriptions to a same nonce is not supported')
      }

      this.subscribers.set(nonce, (result: prb.IMessage): void => {
        this.subscribers.delete(nonce)
        resolve(result)
      })

      setTimeout(() => {
        this.subscribers.delete(nonce)
        reject(new Error('Redis RPC timed out'))
      }, DEFAULT_TIMEOUT)
    })
  }

  public readonly listen = (dispatcher: { dispatch: (message: prb.IMessage) => void }): void => {
    this.sub.subscribe(DEFAULT_CHANNEL, (error) => {
      if (error !== null) {
        throw error
      }

      this.sub.on('messageBuffer', (channel, buffer) => {
        if (channel instanceof Buffer) {
          channel = channel.toString()
        }

        if (channel !== DEFAULT_CHANNEL) {
          console.log('Ignore messages on other channels:', channel)
          return
        }

        const message = prb.Message.decode(buffer)

        if (message.type === prb.MessageType.MTP_REPLY) {
          const callback = this.subscribers.get(message.nonceRef)
          if (typeof callback === 'function') {
            callback(message)
          }
          return
        }

        dispatcher.dispatch(message)
      })
    })
  }
}
