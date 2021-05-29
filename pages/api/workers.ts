import { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponse } from '../../utils/api/interfaces'
import { manager } from '../../utils/redis/sharedClient'
import { prb } from '../../vendor/proto-types/proto'

export default async (_: NextApiRequest, resp: NextApiResponse<ApiResponse<prb.manager.IWorkerState[]>>): Promise<void> => {
  await manager.then(async (tunnel) => {
    const result = await tunnel.query({ content: { queryWorkerState: {} } })
    const data = result.content?.workerStateUpdate?.values

    if (data instanceof Array) {
      resp.json({ data, status: 200 })
    } else {
      resp.status(500).json({ error: `Invalid RPC result: ${JSON.stringify(result)}`, status: 500 })
    }
  }).catch(error => {
    resp.status(500).json({
      error: (error as Error)?.message ?? error,
      status: 500
    })
  })
}
