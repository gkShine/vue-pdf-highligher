'use strict'

const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./base.config')
const utils = require('./utils')

module.exports = merge(baseConfig, {
  mode: 'production',

  entry: {
    app: ['./src/index.js']
  },

  output: {
    path: utils.resolve('./dist'),
    filename: 'index.js',
    chunkFilename: '[id].js',
    libraryTarget: 'umd',
    library: 'GOKUAI',
    umdNamedDefine: true
  },

  externals: {
    vue: {
      root: 'Vue',
      commonjs: 'vue',
      commonjs2: 'vue',
      amd: 'vue'
    }
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ]
})
