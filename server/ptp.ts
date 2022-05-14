import { RpcMethodName, createPtpNode, prb } from '@phala/runtime-bridge-walkie'
import PeerId from 'peer-id'
import express from 'express'
import logger from '../src/utils/logger'
import type { RequestHandler } from 'express'
import type { WalkiePeerStore } from '@phala/runtime-bridge-walkie/src/peer'

const listenAddresses = process.env.PTP_LISTEN_ADDRESSES
  ? process.env.PTP_LISTEN_ADDRESSES.split(',').map((i) => i.trim())
  : []

const bootstrapAddresses = (process.env.PTP_BOOT_NODES || '')
  .split(',')
  .map((i) => i.trim())

export const createPtpContext = async () => {
  const peerId = await PeerId.create({ bits: 2048, keyType: 'RSA' })
  const ptpNode = await createPtpNode({
    peerId,
    role: prb.WalkieRoles.WR_CLIENT,
    chainIdentity: 'client',
    bridgeIdentity: 'client',
    listenAddresses,
    bootstrapAddresses,
  })

  await ptpNode.start()
  logger.info(`PtpNode started as ${peerId.toB58String()}`)

  ptpNode.node.multiaddrs.forEach((ma) => {
    logger.debug('Listening on', `${ma.toString()}/p2p/${peerId.toB58String()}`)
  })

  const getReturnPeers = (store: WalkiePeerStore) =>
    Object.values(store).map((i) => ({
      peerId: i.peerId.toB58String(),
      hostname: i.hostname,
      role: i.role,
      chainIdentity: i.chainIdentity,
      bridgeIdentity: i.bridgeIdentity,
      remoteAddr: i.multiaddr.toString(),
    }))

  const handlePtpDiscover: RequestHandler = (req, res) => {
    res.contentType('application/json')
    res.send({
      dataProviders: getReturnPeers(ptpNode.peerManager.internalDataProviders),
      lifecycleManagers: getReturnPeers(ptpNode.peerManager.lifecycleManagers),
    })
  }

  const handlePtpProxy: RequestHandler = async (req, res) => {
    const { peerIdStr, method } = req.params

    try {
      const peer = ptpNode.peerManager.peers[peerIdStr]

      const ret = await ptpNode.request(
        peer.multiaddr,
        method as RpcMethodName,
        req.body
      )

      const meta = ret.rawResponse ? ret.rawResponse : null

      if (meta) {
        meta.data = null
      }

      res.contentType('application/json')
      res.send({
        data: ret.data,
        hasError: ret.hasError,
        error: ret.error,
        meta,
      })
    } catch (e) {
      logger.error(e)
      res.status(500).send(e)
    }
  }

  const router = express.Router()
  router.use(express.json())

  router.all('/discover', handlePtpDiscover)
  router.all('/proxy/:peerIdStr/:method', handlePtpProxy)

  return {
    router,
  }
}
