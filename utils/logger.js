import { createLogger } from 'bunyan'

export const logger = createLogger({
  level: process.env.LOGGER_LEVEL || 'debug',
  name: 'prb',
  src: true,
})

globalThis.$logger = logger

export default logger
