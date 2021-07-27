import { MessageTarget } from '../../message/proto'

import getServer from '../../server'

const queryFetcher = async (options) => {
  const { query } = await getServer()

  return query({
    to: MessageTarget.MTG_FETCHER,
    ...options,
  })
}

export default (req, res) => {
  queryFetcher(req.body).then((result) => {
    res.status(200).json(result)
  })
}
