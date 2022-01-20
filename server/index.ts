import { createPtpContext } from './ptp'
import express from 'express'
import logger from '../src/utils/logger'
import next from 'next'

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })

const handle = app.getRequestHandler()

const start = async () => {
  await app.prepare()
  const { router } = await createPtpContext()
  const server = express()

  server.use('/ptp', router)

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
}
start().catch((e) => {
  logger.error(e)
})
