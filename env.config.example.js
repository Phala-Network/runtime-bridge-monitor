const REDIS_ENDPOINT = process.env.REDIS_ENDPOINT || 'redis://127.0.0.1:63791'

console.log(`REDIS_ENDPOINT = ${REDIS_ENDPOINT}`)

module.exports = {
  REDIS_ENDPOINT,
}
