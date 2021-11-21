import { MessageTarget } from '../../message/proto'

import getServer from '../../server'

const queryFetcher = async (options) => {
  const { query } = await getServer(process.env.NS_FETCH)

  return query({
    to: MessageTarget.MTG_FETCHER,
    ...options,
  })
}

export default async (req, res) => {
  const result = await queryFetcher(req.body)
  res.status(200).json(result)
}
