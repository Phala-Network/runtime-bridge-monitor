const webpack = require('webpack')
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

let envConfig = {}
let devEnvConfig = {}

try {
  envConfig = require('./env.config')
} catch (error) {
  console.warn('Failed to load env config, skipping...')
}

try {
  devEnvConfig = require('./env.development.config')
} catch (error) {
  console.warn('Failed to load env.development config, skipping...')
}

const baseConfig = {
  webpack: function (config) {
    config.externals = config.externals || {}
    config.externals['styletron-server'] = 'styletron-server'
    config.plugins.push(new webpack.DefinePlugin({
      __server_import: 'import'
    }))
    return config
  }
}

const withTM = require('next-transpile-modules')([], {
  resolveSymlinks: true
})

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

  return withTM({
    ...baseConfig,
    env: envConfig,
  })
}
