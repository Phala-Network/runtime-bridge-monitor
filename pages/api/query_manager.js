import { MessageTarget } from '../../message/proto'

import getServer from '../../server'

const queryManager = async (options) => {
  const { query } = await getServer()

  return query({
    to: MessageTarget.MTG_MANAGER,
    ...options,
  })
}

export default (req, res) => {
  queryManager(JSON.parse(req.body)).then((result) => {
    res.status(200).json(result)
  })
}

export const config = {
  api: {
    bodyParser: false,
  },
}
