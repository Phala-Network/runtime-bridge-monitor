const webpack = require('webpack')
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

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
    }
  }

  return withTM({
    ...baseConfig,
  })
}
