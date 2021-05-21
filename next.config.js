const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

let envConfig = {}
let devEnvConfig = {}

try {
  envConfig = require('./env.config')
  devEnvConfig = require('./env.development.config')
} catch (error) {
  console.warn('Failed to load env config, skipping...')
}

const baseConfig = {
  webpack: function (config) {
    config.externals = config.externals || {}
    config.externals['styletron-server'] = 'styletron-server'
    return config
  },
}

module.exports = (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      ...baseConfig,
      env: {
        ...envConfig,
        ...devEnvConfig,
      },
    }
  }

  return {
    ...baseConfig,
    env: envConfig,
  }
}
