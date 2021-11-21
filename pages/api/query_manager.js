import { MessageTarget } from '../../message/proto'

import getServer from '../../server'

const queryManager = async (ns, options) => {
  const { query } = await getServer(ns)

  return query({
    to: MessageTarget.MTG_MANAGER,
    ...options,
  })
}

export default async (req, res) => {
  const result = await queryManager(req.query.ns, req.body)
  res.status(200).json(result)
}
