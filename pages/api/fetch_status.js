import { MessageTarget } from '../../message/proto'

import getServer from '../../server'
import logger from '../../utils/logger'

const queryFetcherState = async () => {
  const { query } = await getServer()
  const { content: fetcherStateUpdate } = await query({
    to: MessageTarget.values.MTG_FETCHER,
    callOnlineFetcher: {},
  })
  logger.debug(fetcherStateUpdate, 'fetcher state updated.')
  return fetcherStateUpdate
}

export default (req, res) => {
  queryFetcherState().then(({ fetcherStateUpdate }) => {
    res.status(200).json(fetcherStateUpdate)
  })
}
