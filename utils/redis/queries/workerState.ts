import { prb } from '../../../vendor/proto-types/proto'
import { MessageTunnel } from '../client'

export const queryWorkerState = async (client: MessageTunnel): Promise<prb.manager.IWorkerState[]> => {
  return (await client.query({
    content: { queryWorkerState: {} }
  })).content?.workerStateUpdate?.values ?? []
}
